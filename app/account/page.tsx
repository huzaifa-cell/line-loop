import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrdersByEmail } from "@/lib/orders";
import Breadcrumb from "@/components/Breadcrumb";
import AccountTabs from "./AccountTabs";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses?.[0]?.emailAddress ?? "";
  const orders = await getOrdersByEmail(email);

  return (
    <section className="bg-warm-parchment py-[var(--spacing-30)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-6">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Account" }]}
          className="mb-[var(--spacing-30)]"
        />
        <h1 className="text-[32px] font-bold leading-none mb-[var(--spacing-10)]">
          My Account
        </h1>
        <p className="caption opacity-60 mb-[var(--spacing-40)]">
          {email}
        </p>

        <AccountTabs
          orders={orders.map((o) => ({
            orderNumber: o.orderNumber,
            status: o.status,
            total: o.total,
            createdAt: o.createdAt,
            lineCount: o.lines.length,
          }))}
          userEmail={email}
          firstName={user.firstName ?? ""}
          lastName={user.lastName ?? ""}
        />

        {orders.length === 0 && (
          <div className="mt-[var(--spacing-30)]">
            <EmptyState
              heading="No orders yet"
              body="When you place your first order, it'll appear here."
              linkHref="/shop"
              linkLabel="Shop the Collection"
            />
          </div>
        )}
      </div>
    </section>
  );
}
