import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, getAdminCookieOptions } from "@/lib/admin-auth";
import { withAxiom } from "@/lib/axiom/server";

export const POST = withAxiom(async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json(
      { error: "Password required" },
      { status: 400 },
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 },
    );
  }

  const token = await createAdminToken();
  const cookieOpts = getAdminCookieOptions();

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieOpts.name, token, cookieOpts);

  return response;
});
