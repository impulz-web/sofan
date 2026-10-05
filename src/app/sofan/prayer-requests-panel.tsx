"use client";

import { useState } from "react";
import {
  getPendingPrayerRequestCountAction,
  getPrayerRequestAction,
  getSecureAudioUrl,
  updatePrayerRequestStatusAction,
} from "./actions";
import type { PrayerRequest, PrayerStatus } from "@/lib/admin-types";
import adminStyles from "./admin.module.css";
import styles from "./prayer-requests.module.css";

const filters: { id: PrayerStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "prayed_for", label: "Prayed For" },
  { id: "archived", label: "Archived" },
];

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

function statusLabel(status: PrayerStatus) {
  if (status === "prayed_for") return "Prayed For";
  return status === "pending" ? "Pending" : "Archived";
}

function statusClass(status: PrayerStatus) {
  if (status === "pending") return styles.pendingStatus;
  return status === "prayed_for" ? adminStyles.statusPublished : adminStyles.statusDraft;
}

export function PrayerRequestsPanel({
  connected,
  pendingCount,
  onPendingCountChange,
  requests,
  loading,
  filter,
  onFilterChange,
  onRefresh,
}: {
  connected: boolean;
  pendingCount: string | null;
  onPendingCountChange: (count: string) => void;
  requests: PrayerRequest[];
  loading: boolean;
  filter: PrayerStatus | "all";
  onFilterChange: (status: PrayerStatus | "all") => void;
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
      getPendingPrayerRequestCountAction(),
      getPrayerRequestAction(request.id),
    ]);
    if (count !== null) onPendingCountChange(count);
    if (updated) setSelected(updated);
    await onRefresh();
    setBusy(false);
  }

  const buttonText = selected?.status === "archived" ? "Restore to Pending" : "Mark as Prayed For";
  const buttonStatus: PrayerStatus = selected?.status === "archived" ? "pending" : "prayed_for";

  return (
    <section className={adminStyles.panel} aria-labelledby="prayer-requests-heading">
      <div className={adminStyles.sectionHeading}>
        <div>
          <h2 id="prayer-requests-heading">Prayer Requests</h2>
          <p className={adminStyles.mutedText}>{pendingCount === null ? "Pending count unavailable" : `${pendingCount} pending`}</p>
        </div>
      </div>

      <nav className={adminStyles.subnav} aria-label="Prayer request status filters">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? adminStyles.subnavActive : ""}
            aria-current={filter === item.id ? "page" : undefined}
            onClick={() => {
              setSelected(null);
              setAudioUrl("");
              setError("");
              onFilterChange(item.id);
            }}
          >
            {item.label}{item.id === "pending" && pendingCount !== null ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </nav>

      {error && <p className={adminStyles.feedback} role="alert">{error}</p>}
      {!connected ? (
        <p className={adminStyles.emptyState}>Prayer request database is not connected.</p>
      ) : loading ? (
        <p className={adminStyles.emptyState} role="status">Loading prayer requests…</p>
      ) : requests.length === 0 ? (
        <p className={adminStyles.emptyState}>No prayer requests found.</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={adminStyles.dataTable}>
              <thead>
                <tr><th>Name</th><th>Request type</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className={adminStyles.primaryCell}>{request.isAnonymous ? "Anonymous" : request.name || "Name not provided"}</td>
                    <td>{requestType(request)}{request.hasAudio && <span className={styles.duration}> · {duration(request.audioDuration)}</span>}</td>
                    <td>{receivedDate(request.createdAt)}</td>
                    <td><span className={`${adminStyles.statusPill} ${statusClass(request.status)}`}>{statusLabel(request.status)}</span></td>
                    <td><button className={adminStyles.textButton} type="button" onClick={() => void openRequest(request.id)}>Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileList}>
            {requests.map((request) => (
              <article className={styles.mobileCard} key={request.id}>
                <div className={styles.mobileHeading}>
                  <strong>{request.isAnonymous ? "Anonymous" : request.name || "Name not provided"}</strong>
                  <span className={`${adminStyles.statusPill} ${statusClass(request.status)}`}>{statusLabel(request.status)}</span>
                </div>
                <span>{requestType(request)}{request.hasAudio && ` · ${duration(request.audioDuration)}`}</span>
                <span className={adminStyles.mutedText}>{receivedDate(request.createdAt)}</span>
                <button className={adminStyles.secondaryButton} type="button" onClick={() => void openRequest(request.id)}>Open request</button>
              </article>
            ))}
          </div>
        </>
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
            <div><dt>Status</dt><dd>{statusLabel(selected.status)}</dd></div>
            <div><dt>Contact</dt><dd>{selected.isAnonymous ? "Not provided" : selected.phone || "Not provided"}</dd></div>
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
            {selected.status !== "prayed_for" && <button className={adminStyles.primaryButton} type="button" disabled={busy} onClick={() => void updateStatus(selected, buttonStatus)}>{busy ? "Updating…" : buttonText}</button>}
            {selected.status !== "archived" && <button className={adminStyles.secondaryButton} type="button" disabled={busy} onClick={() => void updateStatus(selected, "archived")}>Archive</button>}
          </div>
        </article>
      )}
    </section>
  );
}
