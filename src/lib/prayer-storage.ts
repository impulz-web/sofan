import { randomUUID } from "node:crypto";
import { mkdir, readFile, realpath, unlink, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, sep } from "node:path";
import { parseBuffer } from "music-metadata";
import { MAX_AUDIO_BYTES, MAX_RECORDING_SECONDS } from "@/lib/prayer-config";

export type SupportedAudioMime = "audio/webm" | "audio/mp4" | "audio/ogg" | "audio/wav";

export class AudioValidationError extends Error {}

export interface ValidatedAudio {
  bytes: Buffer;
  durationSeconds: number;
  mimeType: SupportedAudioMime;
  size: number;
  extension: "webm" | "mp4" | "ogg" | "wav";
}

function sniffMimeType(bytes: Buffer): SupportedAudioMime | null {
  if (bytes.length >= 4 && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
    return "audio/webm";
  }
  if (bytes.length >= 4 && bytes.subarray(0, 4).toString("ascii") === "OggS") {
    return "audio/ogg";
  }
  if (bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp") {
    return "audio/mp4";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WAVE"
  ) {
    return "audio/wav";
  }
  return null;
}

function extensionFor(mimeType: SupportedAudioMime): ValidatedAudio["extension"] {
  switch (mimeType) {
    case "audio/webm":
      return "webm";
    case "audio/mp4":
      return "mp4";
    case "audio/ogg":
      return "ogg";
    case "audio/wav":
      return "wav";
  }
}

export async function validateAudioBytes(bytes: Buffer): Promise<ValidatedAudio> {
  if (bytes.byteLength > MAX_AUDIO_BYTES) {
    throw new AudioValidationError("This recording is too large. Please record a shorter message.");
  }
  if (bytes.byteLength === 0) {
    throw new AudioValidationError("We couldn't upload your recording. Please try again.");
  }

  const mimeType = sniffMimeType(bytes);
  if (!mimeType) {
    throw new AudioValidationError("This audio format isn't supported. Please record again.");
  }

  try {
    const metadata = await parseBuffer(bytes, mimeType, { duration: true, skipCovers: true });
    const hasAudioTrack = metadata.format.trackInfo.some((track) => Boolean(track.audio));
    const hasVideoTrack = metadata.format.trackInfo.some((track) => Boolean(track.video));
    const duration = metadata.format.duration;

    if (!hasAudioTrack || hasVideoTrack || !duration || !Number.isFinite(duration)) {
      throw new AudioValidationError("We couldn't upload your recording. Please try again.");
    }
    if (duration > MAX_RECORDING_SECONDS) {
      throw new AudioValidationError("The maximum recording time has been reached.");
    }

    return {
      bytes,
      durationSeconds: Math.max(1, Math.ceil(duration)),
      mimeType,
      size: bytes.byteLength,
      extension: extensionFor(mimeType),
    };
  } catch (error) {
    if (error instanceof AudioValidationError) throw error;
    throw new AudioValidationError("We couldn't upload your recording. Please try again.");
  }
}

function privateStorageDirectory() {
  return join(process.cwd(), "storage", "prayer-requests");
}

async function ensurePrivateStorageDirectory() {
  const directory = privateStorageDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const [resolvedDirectory, publicDirectory] = await Promise.all([
    realpath(directory),
    realpath(join(process.cwd(), "public")),
  ]);
  const fromPublic = relative(publicDirectory, resolvedDirectory);
  if (fromPublic === "" || (!fromPublic.startsWith(`..${sep}`) && fromPublic !== ".." && !isAbsolute(fromPublic))) {
    throw new Error("Prayer audio storage must be outside the public directory.");
  }
  return resolvedDirectory;
}

function safeAudioKey(key: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(webm|mp4|ogg|wav)$/.test(key);
}

export async function savePrivatePrayerAudio(audio: ValidatedAudio) {
  const directory = await ensurePrivateStorageDirectory();
  const key = `${randomUUID()}.${audio.extension}`;
  await writeFile(join(/*turbopackIgnore: true*/ directory, key), audio.bytes, { flag: "wx", mode: 0o600 });
  return key;
}

export async function readPrivatePrayerAudio(key: string) {
  if (!safeAudioKey(key)) throw new Error("Invalid private audio key.");
  return readFile(join(/*turbopackIgnore: true*/ await ensurePrivateStorageDirectory(), key));
}

export async function deletePrivatePrayerAudio(key: string) {
  if (!safeAudioKey(key)) return;
  try {
    await unlink(join(/*turbopackIgnore: true*/ await ensurePrivateStorageDirectory(), key));
  } catch {
    return;
  }
}
