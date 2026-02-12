import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { logger } from "@/lib/axiom/server";
import { transformMiddlewareRequest } from "@axiomhq/nextjs";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  logger.info("middleware", transformMiddlewareRequest(request));

  const response = NextResponse.next();

  event.waitUntil(logger.flush());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
