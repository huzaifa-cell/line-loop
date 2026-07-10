"use server";

import { mutateStore, readStore } from "./file-store";
import { decrementInventory, restockInventory } from "./inventory";
import { getSettings } from "./settings";

/**
 * File-based order store. Orders are created via Server Actions, persisted to
 * .data/orders.json, and queryable by order number or email (for guest
 * tracking and logged-in account history).
 *
 * Payment is never actually processed — card details are validated client-side
 * (Luhn checksum), only last-4 is stored, and paymentStatus stays PENDING until
 * the team manually processes it. This is honest about being a placeholder for
 * a future gateway.
 */

export type OrderStatus = "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CARD" | "COD";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderLine {
  slug: string;
  name: string;
  price: number; // PKR integer at time of purchase
  image: string;
  size: string;
  colour: string;
  qty: number;
  variantId: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface CardDetails {
  // ONLY these fields are stored — never the full PAN or CVV.
  cardholderName: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardBrand: string;
}

export interface Order {
  id: string;
  orderNumber: string; // human-readable, e.g. LL-2026-00001
  lines: OrderLine[];
  shippingAddress: ShippingAddress;
  shippingMethod: "STANDARD" | "EXPRESS";
  shippingCost: number;
  codFee: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cardDetails?: CardDetails; // present only when paymentMethod === CARD
  status: OrderStatus;
  customerEmail: string;
  clerkUserId?: string; // present when logged in
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: OrderStatus; at: string }[];
}

type OrderStore = { orders: Order[]; counter: number };

const FILE = "orders.json";

function emptyStore(): OrderStore {
  return { orders: [], counter: 0 };
}

/** Generate the next order number in sequence. */
function generateOrderNumber(counter: number): string {
  const year = new Date().getFullYear();
  const seq = String(counter + 1).padStart(5, "0");
  return `LL-${year}-${seq}`;
}

/** Validate and build an order from checkout input. */
export interface CreateOrderInput {
  lines: OrderLine[];
  shippingAddress: ShippingAddress;
  shippingMethod: "STANDARD" | "EXPRESS";
  paymentMethod: PaymentMethod;
  cardDetails?: CardDetails;
  discountCode?: string;
  discountAmount?: number;
  clerkUserId?: string;
  notes?: string;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<Order> {
  const settings = await getSettings();

  const subtotal = input.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = input.discountAmount ?? 0;
  const shippingCost =
    subtotal - discount >= settings.freeShippingThreshold
      ? 0
      : input.shippingMethod === "EXPRESS"
        ? settings.expressShipping
        : settings.standardShipping;
  const codFee =
    input.paymentMethod === "COD" && settings.codFee > 0
      ? settings.codFee
      : 0;
  const total = Math.max(0, subtotal - discount) + shippingCost + codFee;

  const now = new Date().toISOString();

  // Decrement inventory
  await decrementInventory(
    input.lines.map((l) => ({ variantId: l.variantId, qty: l.qty }))
  );

  const store = await mutateStore<OrderStore>(FILE, emptyStore(), (current) => {
    const counter = current.counter + 1;
    const order: Order = {
      id: `order-${counter}`,
      orderNumber: generateOrderNumber(current.counter),
      lines: input.lines,
      shippingAddress: input.shippingAddress,
      shippingMethod: input.shippingMethod,
      shippingCost,
      codFee,
      subtotal,
      discount,
      total,
      paymentMethod: input.paymentMethod,
      paymentStatus: "PENDING",
      cardDetails: input.paymentMethod === "CARD" ? input.cardDetails : undefined,
      status: "PLACED",
      customerEmail: input.shippingAddress.email,
      clerkUserId: input.clerkUserId,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: "PLACED", at: now }],
    };
    return {
      orders: [...current.orders, order],
      counter,
    };
  });

  const order = store.orders[store.orders.length - 1];
  return order;
}

/** Look up an order by its human-readable number + email (guest tracking). */
export async function getOrderByNumberAndEmail(
  orderNumber: string,
  email: string
): Promise<Order | null> {
  const store = await readStore<OrderStore>(FILE, emptyStore());
  const order = store.orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === orderNumber.toLowerCase() &&
      o.customerEmail.toLowerCase() === email.toLowerCase()
  );
  return order ?? null;
}

/** Look up a single order by its order number (for account detail pages). */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const store = await readStore<OrderStore>(FILE, emptyStore());
  return store.orders.find(
    (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  ) ?? null;
}

/** List all orders for a given email address (account history + guest lookup). */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const store = await readStore<OrderStore>(FILE, emptyStore());
  return store.orders
    .filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** List all orders for a Clerk user ID (account dashboard). */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const store = await readStore<OrderStore>(FILE, emptyStore());
  return store.orders
    .filter((o) => o.clerkUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** List all orders (admin, later pass). */
export async function getAllOrders(): Promise<Order[]> {
  const store = await readStore<OrderStore>(FILE, emptyStore());
  return store.orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Update an order's status (admin, later pass — but also used for tracking). */
export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus
): Promise<Order | null> {
  const now = new Date().toISOString();
  const store = await mutateStore<OrderStore>(FILE, emptyStore(), (current) => {
    const orders = current.orders.map((o) => {
      if (o.orderNumber.toLowerCase() !== orderNumber.toLowerCase()) return o;
      return {
        ...o,
        status,
        updatedAt: now,
        statusHistory: [...o.statusHistory, { status, at: now }],
      };
    });
    return { ...current, orders };
  });

  // Restock on cancellation
  if (status === "CANCELLED") {
    const order = store.orders.find(
      (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
    );
    if (order) {
      await restockInventory(
        order.lines.map((l) => ({ variantId: l.variantId, qty: l.qty }))
      );
    }
  }

  return (
    store.orders.find(
      (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
    ) ?? null
  );
}
