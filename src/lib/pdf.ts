import { renderToBuffer } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/TicketPDF";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export async function generateTicketPDF(
  ticketCode: string,
  ticketType: string,
  buyerName: string | null,
  qrPayload: string,
): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "H",
  });

  const logoPath = path.join(process.cwd(), "public", "wffl-logo.png");
  const logoBase64 = fs.readFileSync(logoPath).toString("base64");
  const logoDataUrl = `data:image/png;base64,${logoBase64}`;

  const buffer = await renderToBuffer(
    TicketPDF({
      ticketCode,
      ticketType,
      buyerName,
      qrDataUrl,
      logoDataUrl,
    }),
  );

  return Buffer.from(buffer);
}
