import { createHmac, timingSafeEqual } from "node:crypto";
import { AUDIO_SIGNED_URL_TTL_SECONDS } from "@/lib/prayer-config";

interface AudioTokenPayload {
  id: string;
  expiresAt: number;
}

function signingSecret() {
  const secret = process.env.PRAYER_AUDIO_SIGNING_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("Prayer audio signing secret is not configured.");
  }
  return secret;
}

function signatureFor(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

export function createPrayerAudioToken(id: string) {
  const payload: AudioTokenPayload = {
    id,
    expiresAt: Date.now() + AUDIO_SIGNED_URL_TTL_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signatureFor(encodedPayload)}`;
}

export function verifyPrayerAudioToken(token: string): AudioTokenPayload | null {
  const [encodedPayload, suppliedSignature, extra] = token.split(".");
  if (!encodedPayload || !suppliedSignature || extra) return null;

  let expectedSignature: string;
  try {
    expectedSignature = signatureFor(encodedPayload);
  } catch {
    return null;
  }

  const expected = Buffer.from(expectedSignature);
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AudioTokenPayload;
    const latestValidExpiry = Date.now() + (AUDIO_SIGNED_URL_TTL_SECONDS + 30) * 1000;
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.id) ||
      !Number.isSafeInteger(payload.expiresAt) ||
      payload.expiresAt <= Date.now() ||
      payload.expiresAt > latestValidExpiry
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
