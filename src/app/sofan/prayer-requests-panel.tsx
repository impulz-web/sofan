"use client";

import { useState } from "react";
import {
  getNewPrayerRequestCountAction,
  getPrayerRequestAction,
  getSecureAudioUrl,
  updatePrayerRequestStatusAction,
} from "./actions";
import type { PrayerRequest, PrayerStatus } from "@/lib/admin-types";
import adminStyles from "./admin.module.css";
import styles from "./prayer-requests.module.css";

const pipelineStages: { id: PrayerStatus; label: string }[] = [
  { id: "new_request", label: "New Request" },
  { id: "contacted", label: "Contacted" },
  { id: "prayer_in_progress", label: "Prayer in Progress" },
  { id: "follow_up_needed", label: "Follow-up Needed" },
  { id: "answered", label: "Answered" },
  { id: "closed", label: "Closed" },
];

function isPrayerStatus(value: string): value is PrayerStatus {
  return pipelineStages.some((stage) => stage.id === value);
}

function prayerStatusLabel(status: PrayerStatus) {
  return pipelineStages.find((stage) => stage.id === status)?.label ?? "Unknown";
}

function receivedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function duration(seconds: number | null) {
  if (seconds === null) return "";
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function requestType(request: PrayerRequest) {
  if (request.hasAudio && request.requestText?.trim()) return "Written + voice";
  return request.hasAudio ? "Voice Prayer Request" : "Written request";
}

export function PrayerRequestsPanel({
  connected,
  newCount,
  onNewCountChange,
  requests,
  loading,
  onRefresh,
}: {
  connected: boolean;
  newCount: string | null;
  onNewCountChange: (count: string) => void;
  requests: PrayerRequest[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<PrayerRequest | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function openRequest(id: string) {
    setSelected(null);
    setAudioUrl("");
    setError("");
    const request = await getPrayerRequestAction(id);
    if (!request) {
      setError("Could not load this prayer request.");
      return;
    }
    setSelected(request);
    if (request.hasAudio) {
      const result = await getSecureAudioUrl(request.id);
      if (result.success) setAudioUrl(result.url);
      else setError(result.message);
    }
  }

  async function updateStatus(request: PrayerRequest, status: PrayerStatus) {
    setBusy(true);
    setError("");
    const result = await updatePrayerRequestStatusAction(request.id, status);
    if (!result.success) {
      setError(result.message);
      setBusy(false);
      return;
    }

    const [count, updated] = await Promise.all([
      getNewPrayerRequestCountAction(),
      getPrayerRequestAction(request.id),
    ]);
    if (count !== null) onNewCountChange(count);
    if (updated && selected?.id === updated.id) setSelected(updated);
    await onRefresh();
    setBusy(false);
  }

  return (
    <section className={adminStyles.panel} aria-labelledby="prayer-requests-heading">
      <div className={adminStyles.sectionHeading}>
        <div>
          <h2 id="prayer-requests-heading">Prayer Requests</h2>
          <p className={adminStyles.mutedText}>{newCount === null ? "New-request count unavailable" : `${newCount} new requests`}</p>
        </div>
      </div>

      {error && <p className={adminStyles.feedback} role="alert">{error}</p>}
      {!connected ? (
        <p className={adminStyles.emptyState}>Prayer request database is not connected.</p>
      ) : loading ? (
        <p className={adminStyles.emptyState} role="status">Loading prayer requests…</p>
      ) : (
        <div className={styles.pipeline} aria-label="Prayer request pipeline">
          {pipelineStages.map((stage) => {
            const stageRequests = requests.filter((request) => request.status === stage.id);
            return (
              <section className={styles.stage} key={stage.id} aria-labelledby={`prayer-stage-${stage.id}`}>
                <header className={styles.stageHeader}>
                  <h3 id={`prayer-stage-${stage.id}`}>{stage.label}</h3>
                  <span>{stageRequests.length}</span>
                </header>
                <div className={styles.stageCards}>
                  {stageRequests.length === 0 ? (
                    <p className={styles.stageEmpty}>No requests</p>
                  ) : stageRequests.map((request) => (
                    <article className={styles.pipelineCard} key={request.id}>
                      <div className={styles.cardHeading}>
                        <strong>{request.isAnonymous ? "Anonymous" : request.name || "Name not provided"}</strong>
                        {request.hasAudio && <span className={styles.duration}>{duration(request.audioDuration)}</span>}
                      </div>
                      <p>{requestType(request)}</p>
                      <p className={styles.cardContact}>
                        {[request.contactEmail, request.phone].filter(Boolean).join(" · ") || "No contact details"}
                      </p>
                      <p className={styles.cardDate}>{receivedDate(request.createdAt)}</p>
                      <div className={styles.cardActions}>
                        <button
                          className={adminStyles.secondaryButton}
                          type="button"
                          onClick={() => void openRequest(request.id)}
                        >
                          View request
                        </button>
                        <label>
                          <span className={styles.visuallyHidden}>Move {request.isAnonymous ? "anonymous request" : `request from ${request.name || "unnamed visitor"}`}</span>
                          <select
                            value={request.status}
                            disabled={busy}
                            onChange={(event) => {
                              if (isPrayerStatus(event.target.value)) {
                                void updateStatus(request, event.target.value);
                              }
                            }}
                          >
                            {pipelineStages.map((option) => (
                              <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
          {requests.length === 0 && <p className={adminStyles.emptyState}>No prayer requests found.</p>}
        </div>
      )}

      {selected && (
        <article className={styles.detail} aria-labelledby="prayer-detail-heading">
          <div className={styles.detailHeader}>
            <div>
              <p className={adminStyles.mutedText}>Received {receivedDate(selected.createdAt)}</p>
              <h3 id="prayer-detail-heading">Prayer Request</h3>
            </div>
            <button className={adminStyles.textButton} type="button" onClick={() => { setSelected(null); setAudioUrl(""); }}>Close</button>
          </div>
          <dl className={styles.metadata}>
            <div><dt>Name</dt><dd>{selected.isAnonymous ? "Anonymous" : selected.name || "Not provided"}</dd></div>
            <div><dt>Pipeline stage</dt><dd>{prayerStatusLabel(selected.status)}</dd></div>
            <div><dt>Email</dt><dd>{selected.contactEmail || "Not provided"}</dd></div>
            <div><dt>Phone / WhatsApp</dt><dd>{selected.phone || "Not provided"}</dd></div>
            <div><dt>Privacy</dt><dd>{selected.isPrivate ? "Private · Admin only" : "Admin only"}</dd></div>
          </dl>
          {selected.requestText && (
            <section className={styles.written} aria-labelledby="written-prayer-heading">
              <h4 id="written-prayer-heading">Written Request</h4>
              <p>{selected.requestText}</p>
            </section>
          )}
          {selected.hasAudio && (
            <section className={styles.audio} aria-labelledby="voice-prayer-heading">
              <h4 id="voice-prayer-heading">Voice Recording</h4>
              <p className={adminStyles.mutedText}>Duration {duration(selected.audioDuration)} · {selected.audioMimeType} · {receivedDate(selected.createdAt)}</p>
              {audioUrl ? <audio controls preload="none" src={audioUrl} aria-label="Prayer request recording" /> : <p className={adminStyles.emptyState}>{error || "Preparing secure playback…"}</p>}
            </section>
          )}
          <div className={styles.detailActions}>
            <label className={styles.stageField}>
              <span>Pipeline stage</span>
              <select
                value={selected.status}
                disabled={busy}
                onChange={(event) => {
                  if (isPrayerStatus(event.target.value)) {
                    void updateStatus(selected, event.target.value);
                  }
                }}
              >
                {pipelineStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
            </label>
          </div>
        </article>
      )}
    </section>
  );
}
