import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const size = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("size") || "192"), 16),
    1024,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
        }}
      >
        {/* Shield shape */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: size * 0.15,
            border: `${Math.max(size * 0.06, 2)}px solid #3B82F6`,
            color: "white",
            fontSize: size * 0.4,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          G
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
