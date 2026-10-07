// Sends mail through Resend if RESEND_API_KEY is set; otherwise just logs it.
export async function sendEmail({ to, subject, text }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email not sent - no RESEND_API_KEY] to=${to} subject=${subject}\n${text}`);
    return;
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }),
    });
  } catch (e) { console.error('email failed', e); }
}
