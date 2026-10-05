"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactInfo } from "@/data/site";
import { MAX_AUDIO_BYTES, MAX_PRAYER_TEXT_LENGTH, MAX_RECORDING_SECONDS } from "@/lib/prayer-config";
import { getSupportedAudioMimeType } from "@/lib/audio-recorder";

function formatTimer(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function extensionFor(mimeType: string) {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export function PrayerRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestText, setRequestText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingMessage, setRecordingMessage] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const previewUrlRef = useRef("");
  const maxDurationReachedRef = useRef(false);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function clearRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    clearTimer();
    stopTracks();
    recorderRef.current = null;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreviewUrl("");
    setRecordedBlob(null);
    setElapsedSeconds(0);
    setRecording(false);
  }

  useEffect(() => () => {
    clearTimer();
    stopTracks();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  async function startRecording() {
    setRecordingMessage("");
    setSubmissionMessage("");
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setRecordingMessage("Voice recording is not supported on this browser. Please submit your prayer request as text.");
      return;
    }

    clearRecording();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      maxDurationReachedRef.current = false;
      const preferredType = getSupportedAudioMimeType();
      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        clearTimer();
        stopTracks();
        setRecording(false);
        const mimeType = recorder.mimeType || preferredType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > MAX_AUDIO_BYTES) {
          setRecordingMessage("This recording is too large. Please record a shorter message.");
          setRecordedBlob(null);
          return;
        }
        if (blob.size === 0) {
          setRecordingMessage("We couldn't prepare your recording. Please record again.");
          return;
        }
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setRecordedBlob(blob);
        if (maxDurationReachedRef.current) {
          setRecordingMessage("The maximum recording time has been reached.");
        }
      };
      recorder.start(250);
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        if (elapsed >= MAX_RECORDING_SECONDS) {
          maxDurationReachedRef.current = true;
          setElapsedSeconds(MAX_RECORDING_SECONDS);
          setRecordingMessage("The maximum recording time has been reached.");
          if (recorder.state !== "inactive") recorder.stop();
          return;
        }
        setElapsedSeconds(elapsed);
      }, 250);
    } catch (error) {
      stopTracks();
      setRecording(false);
      if (error instanceof DOMException && (error.name === "NotSupportedError" || error.name === "NotReadableError")) {
        setRecordingMessage("Voice recording is not supported on this browser. Please submit your prayer request as text.");
      } else if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
        setRecordingMessage("Microphone access was denied. Please allow microphone access in your browser settings or submit your prayer request as text.");
      } else {
        setRecordingMessage("We couldn't start recording. Please try again or submit your prayer request as text.");
      }
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    clearTimer();
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      setRecording(false);
      stopTracks();
    }
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecordingMessage("");
    setSubmissionMessage("");
    const trimmedRequest = requestText.trim();
    if (!trimmedRequest && !recordedBlob) {
      setSubmissionMessage("Please write a prayer request or record a voice message.");
      return;
    }
    if (recordedBlob && recordedBlob.size > MAX_AUDIO_BYTES) {
      setSubmissionMessage("This recording is too large. Please record a shorter message.");
      return;
    }

    const formData = new FormData();
    formData.append("name", anonymous ? "" : name.trim());
    formData.append("email", anonymous ? "" : email.trim());
    formData.append("phone", anonymous ? "" : phone.trim());
    formData.append("requestText", trimmedRequest);
    formData.append("isAnonymous", String(anonymous));
    formData.append("isPrivate", String(isPrivate));
    if (recordedBlob) {
      formData.append("audio", recordedBlob, `prayer-request.${extensionFor(recordedBlob.type)}`);
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/prayer-requests", { method: "POST", body: formData });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setSubmissionMessage(result?.error || "We couldn't receive your prayer request right now. Please try again or contact us on WhatsApp.");
        return;
      }

      setSubmissionMessage("Your prayer request has been received.");
      setName("");
      setEmail("");
      setPhone("");
      setRequestText("");
      setAnonymous(false);
      setIsPrivate(true);
      setRecordingMessage("");
      clearRecording();
    } catch {
      setSubmissionMessage("We couldn't upload your recording. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="prayer-request-form" onSubmit={submitRequest}>
      <div className="prayer-request-form__fields">
        <label className="prayer-request-form__field" htmlFor="prayer-name">
          <span>Name {!anonymous && <span className="prayer-request-form__optional">Required</span>}</span>
          <input id="prayer-name" name="name" autoComplete="name" value={name} required={!anonymous} disabled={anonymous || submitting} onChange={(event) => setName(event.target.value)} maxLength={160} />
        </label>
        <label className="prayer-request-form__field" htmlFor="prayer-email">
          <span>Email <span className="prayer-request-form__optional">Optional</span></span>
          <input id="prayer-email" name="email" type="email" autoComplete="email" value={email} disabled={anonymous || submitting} onChange={(event) => setEmail(event.target.value)} maxLength={254} />
        </label>
        <label className="prayer-request-form__field" htmlFor="prayer-phone">
          <span>WhatsApp / phone <span className="prayer-request-form__optional">Optional</span></span>
          <input id="prayer-phone" name="phone" type="tel" autoComplete="tel" value={phone} disabled={anonymous || submitting} onChange={(event) => setPhone(event.target.value)} maxLength={80} />
        </label>
        <label className="prayer-request-form__anonymous">
          <input type="checkbox" checked={anonymous} disabled={submitting} onChange={(event) => setAnonymous(event.target.checked)} />
          Submit anonymously
        </label>
        <label className="prayer-request-form__anonymous">
          <input type="checkbox" checked={isPrivate} disabled={submitting} onChange={(event) => setIsPrivate(event.target.checked)} />
          Private / Confidential — keep this request for the pastoral team
        </label>
        <label className="prayer-request-form__field" htmlFor="prayer-request-text">
          <span>Prayer request <span className="prayer-request-form__optional">Required unless you record a voice note</span></span>
          <textarea id="prayer-request-text" name="requestText" rows={5} value={requestText} disabled={submitting} onChange={(event) => setRequestText(event.target.value)} maxLength={MAX_PRAYER_TEXT_LENGTH} />
        </label>
      </div>

      <section className="prayer-recorder" aria-labelledby="prayer-recorder-heading">
        <div className="prayer-recorder__heading">
          <div>
            <p className="eyebrow eyebrow--terracotta">Voice note</p>
            <h3 id="prayer-recorder-heading">Share your prayer request</h3>
          </div>
          <span className="prayer-recorder__limit">Max {formatTimer(MAX_RECORDING_SECONDS)}</span>
        </div>

        {recording ? (
          <div className="prayer-recorder__active" role="status" aria-live="polite">
            <div className="prayer-recorder__recording-line"><span className="prayer-recorder__dot" />Recording</div>
            <strong className="prayer-recorder__timer">{formatTimer(elapsedSeconds)}</strong>
            <button className="prayer-recorder__stop" type="button" aria-label="Stop recording prayer request" onClick={stopRecording}>Stop recording</button>
          </div>
        ) : recordedBlob && previewUrl ? (
          <div className="prayer-recorder__preview">
            <div>
              <p className="prayer-recorder__preview-label">Your recording</p>
              <p className="prayer-recorder__timer">{formatTimer(elapsedSeconds)}</p>
            </div>
            <audio controls preload="metadata" src={previewUrl} aria-label="Preview your prayer request recording" />
            <div className="prayer-recorder__actions">
              <button className="prayer-recorder__secondary" type="button" disabled={submitting} onClick={clearRecording}>Delete</button>
              <button className="prayer-recorder__secondary" type="button" disabled={submitting} onClick={startRecording}>Record again</button>
            </div>
          </div>
        ) : (
          <button className="prayer-recorder__start" type="button" disabled={submitting} aria-label="Start recording prayer request" onClick={() => void startRecording()}>
            <span aria-hidden="true">🎙</span> Record prayer request
          </button>
        )}

        {recordingMessage && <p className="prayer-request-form__message" role="status">{recordingMessage}</p>}
      </section>

      <div className="prayer-request-form__submit-row">
        <button className="prayer-request-form__submit" type="submit" disabled={submitting || recording}>
          {submitting ? "Submitting…" : "Submit Prayer Request"}
        </button>
        <a className="prayer-request-form__whatsapp" href={contactInfo.whatsappUrl} target="_blank" rel="noreferrer">
          Prefer WhatsApp? Send a voice note
        </a>
      </div>
      {submissionMessage && <p className="prayer-request-form__message" role="status" aria-live="polite">{submissionMessage}</p>}
      <p className="prayer-request-form__message">
        All requests are admin-only and are never published publicly.
      </p>
    </form>
  );
}
