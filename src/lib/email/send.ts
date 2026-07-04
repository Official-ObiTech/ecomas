import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "Ecomas <onboarding@resend.dev>";

export async function sendEmail(params: { to: string | string[]; subject: string; html: string }) {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) console.error("Resend error:", error);
    return !error;
  } catch (e) {
    console.error("Email send failed:", e);
    return false;
  }
}