import { renderToBuffer } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/TicketPDF";
import QRCode from "qrcode";

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

  const buffer = await renderToBuffer(
    TicketPDF({
      ticketCode,
      ticketType,
      buyerName,
      qrDataUrl,
    }),
  );

  return Buffer.from(buffer);
}
