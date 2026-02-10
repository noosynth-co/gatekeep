import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

export async function sendTicketEmail(
  to: string,
  buyerName: string | null,
  ticketCode: string,
  ticketType: string,
  pdfBuffer: Buffer,
) {
  const { error } = await getResend().emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Your ticket: ${ticketCode} — GateKeep`,
    html: `
      <h1>Your ticket is ready!</h1>
      <p>Hi ${buyerName || "there"},</p>
      <p>Your <strong>${ticketType}</strong> ticket has been confirmed.</p>
      <p>Ticket code: <strong>${ticketCode}</strong></p>
      <p>Please find your ticket PDF attached. Show the QR code at the entrance.</p>
      <p>See you at the event!</p>
    `,
    attachments: [
      {
        filename: `ticket-${ticketCode}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
