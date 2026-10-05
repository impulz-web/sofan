import { getPrayerAudioRecord } from "@/lib/admin-repository";
import { readPrivatePrayerAudio } from "@/lib/prayer-storage";
import { verifyPrayerAudioToken } from "@/lib/prayer-audio-token";

const audioTypes = new Set(["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"]);

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return notFound();

  const payload = verifyPrayerAudioToken(token);
  if (!payload) return notFound();

  try {
    const record = await getPrayerAudioRecord(payload.id);
    if (!record?.audioPath || !record.audioMimeType || !audioTypes.has(record.audioMimeType)) {
      return notFound();
    }

    const audio = await readPrivatePrayerAudio(record.audioPath);
    const size = audio.byteLength;
    const rangeHeader = request.headers.get("range");
    let start = 0;
    let end = size - 1;
    let status = 200;

    if (rangeHeader) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (!range || (!range[1] && !range[2])) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}`, "Cache-Control": "private, no-store" },
        });
      }

      if (!range[1]) {
        const suffixLength = Number(range[2]);
        start = Math.max(0, size - suffixLength);
      } else {
        start = Number(range[1]);
        if (range[2]) end = Math.min(Number(range[2]), size - 1);
      }

      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}`, "Cache-Control": "private, no-store" },
        });
      }
      status = 206;
    }

    const chunk = new Uint8Array(audio.subarray(start, end + 1));
    const headers = new Headers({
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Length": String(chunk.byteLength),
      "Content-Type": record.audioMimeType,
      "Content-Disposition": "inline; filename=prayer-request-audio",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    });
    if (status === 206) headers.set("Content-Range", `bytes ${start}-${end}/${size}`);

    return new Response(chunk, { status, headers });
  } catch {
    return notFound();
  }
}
