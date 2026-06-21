import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });

const fromEmail = process.env.MAILERSEND_FROM_EMAIL || 'noreply@resend.dev';
const fromName = process.env.MAILERSEND_FROM_NAME || 'Autoniv';

export async function sendAppointmentEmail({ to, appointment }) {
  const name = String(appointment.name || 'there').trim();
  const service = String(appointment.service || 'your appointment').trim();
  const date = String(appointment.preferredDate || 'the scheduled date').trim();
  const time = String(appointment.preferredTime || 'the scheduled time').trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #080d17; border-radius: 12px; border: 1px solid rgba(0,119,255,0.15);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #0077ff, #00c8b4); line-height: 48px; color: white; font-size: 20px; font-weight: bold;">A</div>
      </div>
      <h2 style="color: #ffffff; text-align: center; margin-bottom: 8px;">Appointment Confirmed</h2>
      <p style="color: #94a3b8; text-align: center; font-size: 14px; margin-bottom: 24px;">
        Hi ${name}, your appointment has been confirmed!
      </p>
      <div style="background: rgba(0,119,255,0.1); border: 1px solid rgba(0,119,255,0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <table style="width: 100%; color: #e2e8f0; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #94a3b8;">Service</td><td style="padding: 6px 0; text-align: right;">${service}</td></tr>
          <tr><td style="padding: 6px 0; color: #94a3b8;">Date</td><td style="padding: 6px 0; text-align: right;">${date}</td></tr>
          <tr><td style="padding: 6px 0; color: #94a3b8;">Time</td><td style="padding: 6px 0; text-align: right;">${time}</td></tr>
        </table>
      </div>
      <p style="color: #64748b; text-align: center; font-size: 12px;">If you need to reschedule, please contact us.</p>
    </div>
  `;

  const sentFrom = new Sender(fromEmail, fromName);
  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Autoniv — Appointment Confirmed')
    .setHtml(html);

  const info = await mailerSend.email.send(emailParams);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Appointment email sent:', info);
  }

  return info;
}
