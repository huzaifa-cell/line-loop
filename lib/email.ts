import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  customerName: string,
  totalAmount: number,
  paymentMethod: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping order confirmation email.");
    return { success: false, error: "API key not configured" };
  }

  const subject = `Order Confirmation - LINE & LOOP #${orderNumber}`;
  
  const paymentText = paymentMethod === "bank" 
    ? "Payment Method: Bank Transfer. Your order is pending until proof of payment is received and verified."
    : "Payment Method: Cash on Delivery. You will pay for your order upon delivery.";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2B2118;">
      <h1 style="text-align: center; letter-spacing: 0.1em; text-transform: uppercase;">LINE & LOOP</h1>
      <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
      
      <p>Dear ${customerName},</p>
      
      <p>Thank you for your order! We are currently processing it. Here are your order details:</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> #${orderNumber}</p>
        <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> Rs. ${totalAmount.toLocaleString()}</p>
        <p style="margin: 0;"><strong>${paymentText}</strong></p>
      </div>
      
      <p>We will notify you once your order has been shipped.</p>
      
      <p style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
        LINE & LOOP · Handmade garments, made slowly.
      </p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: "LINE & LOOP <orders@lineloop.com>",
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
