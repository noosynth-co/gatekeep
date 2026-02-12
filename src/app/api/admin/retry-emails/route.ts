import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { retryUnsentEmails } from "@/lib/retry-emails";
import { withAxiom } from "@/lib/axiom/server";

export const POST = withAxiom(async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminToken();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { limit } = await req.json().catch(() => ({}) as { limit?: number });

  try {
    const result = await retryUnsentEmails(limit || 10);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
});
