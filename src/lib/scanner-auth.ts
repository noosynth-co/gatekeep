import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { ScannerJWTPayload } from "@/types";

const SECRET = () => new TextEncoder().encode(process.env.SCANNER_JWT_SECRET!);
const COOKIE_NAME = "scanner_token";

export async function createScannerToken(
  scannerId: string,
  scannerName: string,
): Promise<string> {
  return new SignJWT({ scannerId, scannerName })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .setIssuedAt()
    .sign(SECRET());
}

export async function verifyScannerToken(): Promise<ScannerJWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET());
    return payload as unknown as ScannerJWTPayload;
  } catch {
    return null;
  }
}

export function getScannerCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 12 * 60 * 60, // 12 hours
    path: "/",
  };
}
