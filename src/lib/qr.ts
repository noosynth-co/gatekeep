import crypto from "crypto";

const SECRET = () => process.env.QR_SIGNING_SECRET!;

export function generateQRPayload(ticketCode: string): {
  payload: string;
  hmac: string;
} {
  const timestamp = Date.now().toString();
  const message = `${ticketCode}.${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", SECRET())
    .update(message)
    .digest("hex");
  const payload = `${message}.${hmac}`;
  return { payload, hmac };
}

export function verifyQRPayload(payload: string): {
  valid: boolean;
  ticketCode: string | null;
} {
  const parts = payload.split(".");
  if (parts.length !== 3) return { valid: false, ticketCode: null };

  const [ticketCode, timestamp, receivedHmac] = parts;
  const message = `${ticketCode}.${timestamp}`;
  const expectedHmac = crypto
    .createHmac("sha256", SECRET())
    .update(message)
    .digest("hex");

  const receivedBuffer = Buffer.from(receivedHmac, "hex");
  const expectedBuffer = Buffer.from(expectedHmac, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return { valid: false, ticketCode: null };
  }

  const valid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  return { valid, ticketCode: valid ? ticketCode : null };
}
