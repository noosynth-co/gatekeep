import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = () => new TextEncoder().encode(process.env.SCANNER_JWT_SECRET!);
const COOKIE_NAME = "admin_token";

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(SECRET());
}

export async function verifyAdminToken(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, SECRET());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function getAdminCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  };
}
