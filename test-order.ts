import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lunyvqiywzyyiixpwotb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bnl2cWl5d3p5eWlpeHB3b3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkxMTc2MSwiZXhwIjoyMDk5NDg3NzYxfQ.obI1nCuIHIkXbfhZo2QwlC6JX_7yoU0tQ38xZF1vJ8c"
);

async function test() {
  const orderNumber = "LL-2024-1010-TEST";
  const data = {
    paymentMethod: "cod",
    subtotal: 1000,
    shippingCost: 200,
    discountAmount: 0,
    grandTotal: 1200,
    shippingAddress: {
      email: "test@example.com",
      fullName: "Test User",
      phone: "123456789",
      addressLine1: "123 Test St",
      city: "Test City",
      province: "Test Prov",
      postalCode: "12345",
      country: "Pakistan"
    }
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      guest_email: data.shippingAddress.email,
      status: 'pending',
      payment_method: data.paymentMethod === 'bank' ? 'bank_transfer' : data.paymentMethod,
      payment_status: data.paymentMethod === 'cod' ? 'cod_pending' : (data.paymentMethod === 'bank' ? 'bank_transfer_under_review' : 'pending'),
      subtotal: data.subtotal,
      shipping_amount: data.shippingCost,
      discount_amount: data.discountAmount || 0,
      total: data.grandTotal,
      shipping_address: data.shippingAddress,
      discount_code: null
    })
    .select('id')
    .single();

  if (orderError) {
    console.error("Insert Error:", orderError);
  } else {
    console.log("Inserted order:", order);
  }
}

test();
