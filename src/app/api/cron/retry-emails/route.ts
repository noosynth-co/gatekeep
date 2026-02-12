import { NextRequest, NextResponse } from "next/server";
import { retryUnsentEmails } from "@/lib/retry-emails";
import { logger, withAxiom } from "@/lib/axiom/server";

export const GET = withAxiom(async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await retryUnsentEmails(10);
    logger.info("Cron retry-emails completed", result);
    return NextResponse.json(result);
  } catch (err) {
    logger.error("Cron retry-emails failed", {
      error: err instanceof Error ? err.message : err,
    });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
