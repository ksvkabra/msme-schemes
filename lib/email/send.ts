import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = FROM_EMAIL,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: message };
  }
}

/** After onboarding: send eligibility summary. */
export function eligibilitySummaryHtml(
  userName: string,
  eligibleCount: number,
  schemeNames: string[]
): string {
  return `
    <h2>Welcome, ${userName}</h2>
    <p>Based on your business profile, you are eligible for <strong>${eligibleCount}</strong> scheme(s):</p>
    <ul>${schemeNames.map((n) => `<li>${n}</li>`).join("")}</ul>
    <p>Log in to your dashboard to view details and apply.</p>
  `;
}
