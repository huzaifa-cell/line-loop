import { Resend } from "resend";
try {
  const resend = new Resend(undefined);
  console.log("Resend initialized:", resend);
} catch (e) {
  console.error("Resend crash:", e);
}
