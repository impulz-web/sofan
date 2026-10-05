import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { createTestimonySubmission } from "@/lib/testimony-service";

const unavailableMessage = "We couldn't receive your testimony right now. Please try again later.";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return jsonError(unavailableMessage, 503);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonError("The submission origin is not allowed.", 403);
      }
    } catch {
      return jsonError("The submission origin is not allowed.", 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(contentLength) || contentLength > 50_000) {
    return jsonError("The testimony is too large to submit.", 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Enter valid testimony details.", 400);
  }
  if (!isRecord(body)) {
    return jsonError("Enter valid testimony details.", 400);
  }

  const input = body;
  if (
    typeof input.content !== "string" ||
    typeof input.isAnonymous !== "boolean" ||
    typeof input.publicationConsent !== "boolean"
  ) {
    return jsonError("Enter valid testimony details.", 400);
  }

  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const content = input.content.trim();
  if (!content || content.length > 10_000 || displayName.length > 120) {
    return jsonError("Enter a testimony under 10,000 characters and a name under 120 characters.", 400);
  }
  if (!input.isAnonymous && !displayName) {
    return jsonError("Enter your name or choose to submit anonymously.", 400);
  }
  if (email.length > 254 || phone.length > 80) {
    return jsonError("Please shorten your contact details.", 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Enter a valid email address or leave it blank.", 400);
  }

  const result = await createTestimonySubmission({
    content,
    displayName: input.isAnonymous ? "" : displayName,
    email,
    phone,
    isAnonymous: input.isAnonymous,
    publicationConsent: input.publicationConsent,
  });
  if (!result.success) return jsonError(result.message, 503);

  return NextResponse.json(
    { success: true },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
