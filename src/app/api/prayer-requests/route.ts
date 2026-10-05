import { NextResponse } from "next/server";
import { createPrayerRequest } from "@/lib/admin-repository";
import { isDatabaseConfigured } from "@/lib/db";
import { MAX_AUDIO_BYTES, MAX_PRAYER_EMAIL_LENGTH, MAX_PRAYER_NAME_LENGTH, MAX_PRAYER_PHONE_LENGTH, MAX_PRAYER_TEXT_LENGTH } from "@/lib/prayer-config";
import { AudioValidationError, deletePrivatePrayerAudio, savePrivatePrayerAudio, validateAudioBytes } from "@/lib/prayer-storage";

const unavailableMessage = "We couldn't receive your prayer request right now. Please try again or contact us on WhatsApp.";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return jsonError(unavailableMessage, 503);
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonError(unavailableMessage, 403);
      }
    } catch {
      return jsonError(unavailableMessage, 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_AUDIO_BYTES + 128_000) {
    return jsonError("This recording is too large. Please record a shorter message.", 413);
  }

  let audioPath: string | null = null;
  let requestWasSaved = false;

  try {
    const formData = await request.formData();
    const isAnonymous = formData.get("isAnonymous") === "true";
    const isPrivateValue = formData.get("isPrivate");
    const requestTextValue = formData.get("requestText");
    const nameValue = formData.get("name");
    const emailValue = formData.get("email");
    const phoneValue = formData.get("phone");
    const audioValue = formData.get("audio");

    const requestText = typeof requestTextValue === "string" ? requestTextValue.trim() : "";
    if (isPrivateValue !== "true" && isPrivateValue !== "false" && isPrivateValue !== null) {
      return jsonError("Select a valid privacy option.", 400);
    }
    if (requestText.length > MAX_PRAYER_TEXT_LENGTH) {
      return jsonError("Please keep your prayer request under 10,000 characters.", 400);
    }

    let name = typeof nameValue === "string" ? nameValue.trim() : "";
    let email = typeof emailValue === "string" ? emailValue.trim() : "";
    let phone = typeof phoneValue === "string" ? phoneValue.trim() : "";
    if (
      name.length > MAX_PRAYER_NAME_LENGTH ||
      email.length > MAX_PRAYER_EMAIL_LENGTH ||
      phone.length > MAX_PRAYER_PHONE_LENGTH
    ) {
      return jsonError("Please shorten the contact details and try again.", 400);
    }
    if (!isAnonymous && !name) {
      return jsonError("Please enter your name or choose to submit anonymously.", 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Enter a valid email address or leave it blank.", 400);
    }
    if (isAnonymous) {
      name = "";
      email = "";
      phone = "";
    }

    let validatedAudio: Awaited<ReturnType<typeof validateAudioBytes>> | null = null;
    if (audioValue instanceof File && audioValue.size > 0) {
      if (audioValue.size > MAX_AUDIO_BYTES) {
        return jsonError("This recording is too large. Please record a shorter message.", 413);
      }
      const bytes = Buffer.from(await audioValue.arrayBuffer());
      validatedAudio = await validateAudioBytes(bytes);
    } else if (audioValue && !(audioValue instanceof File)) {
      return jsonError("We couldn't upload your recording. Please try again.", 400);
    }

    if (!requestText && !validatedAudio) {
      return jsonError("Please write a prayer request or record a voice message.", 400);
    }

    if (validatedAudio) {
      audioPath = await savePrivatePrayerAudio(validatedAudio);
    }

    const id = await createPrayerRequest({
      name: name || null,
      contactEmail: email || null,
      phone: phone || null,
      requestText: requestText || null,
      audioPath,
      audioDuration: validatedAudio?.durationSeconds ?? null,
      audioMimeType: validatedAudio?.mimeType ?? null,
      audioSize: validatedAudio?.size ?? null,
      isAnonymous,
      isPrivate: isPrivateValue !== "false",
    });

    if (!id) throw new Error("Request insert failed.");
    requestWasSaved = true;

    return NextResponse.json({ success: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (audioPath && !requestWasSaved) {
      try {
        await deletePrivatePrayerAudio(audioPath);
      } catch (cleanupError) {
        console.error("Failed to clean up an unlinked prayer recording.", cleanupError);
      }
    }
    if (error instanceof AudioValidationError) {
      const status = error.message.includes("too large") ? 413 : 400;
      return jsonError(error.message, status);
    }
    return jsonError(unavailableMessage, 503);
  }
}
