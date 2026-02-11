import { Resend } from "resend";
import { EVENT } from "@/lib/constants";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

const LOGO_URL = "https://worldfreakfightleague.com/img/WFFL%20Logo_White.png";

function buildTicketEmailHtml(
  buyerName: string | null,
  ticketCode: string,
  ticketType: string,
): string {
  const name = buyerName || "there";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>Your Ticket — World Freak Fight League</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,Helvetica,sans-serif;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your ${ticketType} ticket for ${EVENT.name} is confirmed! Check your attachment for the QR code.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">

          <!-- HEADER / LOGO -->
          <tr>
            <td align="center" style="background-color:#0f0f0f;border-radius:12px 12px 0 0;padding:32px 40px;">
              <img src="${LOGO_URL}" alt="World Freak Fight League" width="120" style="display:block;width:120px;height:auto;" />
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background-color:#1a1a1a;padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;">
                You're In!
              </h1>
              <p style="margin:0;font-size:16px;color:#a1a1aa;line-height:1.5;">
                Your ticket has been confirmed, ${name}.
              </p>
            </td>
          </tr>

          <!-- TICKET CARD -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:2px solid #e4e4e7;border-radius:12px;overflow:hidden;margin:0 auto;">
                <!-- Ticket type banner -->
                <tr>
                  <td style="background-color:#dc2626;padding:14px 24px;text-align:center;">
                    <span style="font-size:13px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:2px;">
                      ${ticketType} Ticket
                    </span>
                  </td>
                </tr>
                <!-- Event details -->
                <tr>
                  <td style="padding:24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Event</p>
                          <p style="margin:0;font-size:18px;font-weight:700;color:#18181b;">${EVENT.name}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td width="50%" style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Date</p>
                                <p style="margin:0;font-size:14px;color:#18181b;font-weight:600;">${EVENT.date}</p>
                              </td>
                              <td width="50%" style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Venue</p>
                                <p style="margin:0;font-size:14px;color:#18181b;font-weight:600;">${EVENT.venue}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td width="50%" style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Attendee</p>
                                <p style="margin:0;font-size:14px;color:#18181b;font-weight:600;">${name}</p>
                              </td>
                              <td width="50%" style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Ticket Code</p>
                                <p style="margin:0;font-size:14px;color:#18181b;font-weight:600;font-family:'Courier New',Courier,monospace;">${ticketCode}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA SECTION -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#fef2f2;border-radius:8px;width:100%;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#dc2626;">Check Your Attachment</p>
                    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
                      Your ticket PDF with QR code is attached to this email.<br />
                      Show it at the entrance gate for quick entry.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TIPS -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top:1px solid #e4e4e7;padding-top:24px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#18181b;">Before the Event</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:10px;font-size:14px;color:#dc2626;font-weight:700;">1.</td>
                        <td style="font-size:14px;color:#52525b;line-height:1.5;">Save or print the attached PDF ticket</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:10px;font-size:14px;color:#dc2626;font-weight:700;">2.</td>
                        <td style="font-size:14px;color:#52525b;line-height:1.5;">Have your QR code ready on your phone or printout</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:10px;font-size:14px;color:#dc2626;font-weight:700;">3.</td>
                        <td style="font-size:14px;color:#52525b;line-height:1.5;">Do not share your QR code — it's valid for one-time entry only</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0f0f0f;border-radius:0 0 12px 12px;padding:28px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="WFFL" width="48" style="display:inline-block;width:48px;height:auto;margin-bottom:12px;" />
              <p style="margin:0 0 4px;font-size:12px;color:#71717a;line-height:1.5;">
                World Freak Fight League
              </p>
              <p style="margin:0;font-size:11px;color:#52525b;line-height:1.5;">
                This is an automated confirmation email. Please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
    subject: `Your ${ticketType} Ticket for ${EVENT.name} 🎟️`,
    html: buildTicketEmailHtml(buyerName, ticketCode, ticketType),
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
