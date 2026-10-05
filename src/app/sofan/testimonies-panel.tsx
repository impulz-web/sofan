"use client";

import { useEffect, useState } from "react";
import type { Testimony, TestimonyModerationStatus } from "@/lib/admin-types";
import {
  getTestimoniesAction,
  moderateTestimonyAction,
  setTestimonyPublishedAction,
} from "./actions";
import styles from "./admin.module.css";

function statusLabel(status: TestimonyModerationStatus) {
  return status === "pending" ? "Pending review" : status === "approved" ? "Approved" : "Rejected";
}

function statusClass(status: TestimonyModerationStatus) {
  return status === "approved" ? styles.statusPublished : status === "rejected" ? styles.statusDraft : "";
}

function dateLabel(value: string) {
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

export function TestimoniesPanel({
  connected,
  canPublish,
}: {
  connected: boolean;
  canPublish: boolean;
}) {
  const [rows, setRows] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(connected);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function loadRows() {
    if (!connected) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getTestimoniesAction();
      if (result.success) setRows(result.rows);
      else {
        setRows([]);
        setMessage(result.message);
      }
    } catch {
      setRows([]);
      setMessage("Your admin session may have expired. Sign in again to continue.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!connected) return;
    let active = true;
    getTestimoniesAction().then((result) => {
      if (!active) return;
      if (result.success) {
        setRows(result.rows);
        setMessage("");
      } else {
        setRows([]);
        setMessage(result.message);
      }
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setRows([]);
      setMessage("Your admin session may have expired. Sign in again to continue.");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [connected]);

  async function perform(id: string, operation: () => Promise<{ success: boolean; message?: string }>) {
    setBusyId(id);
    setMessage("");
    try {
      const result = await operation();
      if (result.success) await loadRows();
      else setMessage(result.message ?? "Could not update testimony.");
    } catch {
      setMessage("Your admin session may have expired. Sign in again to continue.");
    }
    setBusyId("");
  }

  return (
    <section className={styles.panel} aria-labelledby="testimonies-heading">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="testimonies-heading">Testimony submissions</h2>
          <p className={styles.mutedText}>Submissions remain private until approved and explicitly published.</p>
        </div>
        <button className={styles.textButton} type="button" onClick={() => void loadRows()} disabled={loading || !connected}>
          Refresh
        </button>
      </div>

      {!canPublish && (
        <p className={styles.feedback}>
          You can review submissions, but publishing permission is disabled by the server configuration.
        </p>
      )}
      {message && <p className={styles.feedback} role="status">{message}</p>}
      {loading ? <p className={styles.emptyState}>Loading submissions…</p>
        : rows.length === 0 ? <p className={styles.emptyState}>No testimony submissions found.</p>
          : <div className={styles.mobileRecords}>
            {rows.map((testimony) => (
              <article className={styles.mobileRecord} key={testimony.id}>
                <div className={styles.mobileRecordTop}>
                  <strong>{testimony.isAnonymous ? "Anonymous" : testimony.displayName || "Name not provided"}</strong>
                  <span className={`${styles.statusPill} ${statusClass(testimony.moderationStatus)}`}>
                    {statusLabel(testimony.moderationStatus)}
                  </span>
                </div>
                <p className={styles.mutedText}>Submitted {dateLabel(testimony.createdAt)}</p>
                {(testimony.email || testimony.phone) && (
                  <p className={styles.mutedText}>
                    Contact: {[testimony.email, testimony.phone].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className={styles.testimonyContent}>{testimony.content}</p>
                <p className={styles.mutedText}>
                  {testimony.publicationConsent ? "Publication consent given" : "No publication consent"}
                  {testimony.published ? " · Published" : ""}
                </p>
                <div className={styles.rowActions}>
                  <button
                    className={styles.textButton}
                    type="button"
                    disabled={busyId === testimony.id || testimony.moderationStatus === "approved"}
                    onClick={() => void perform(testimony.id, () => moderateTestimonyAction(testimony.id, "approved"))}
                  >
                    Approve
                  </button>
                  <button
                    className={styles.textButton}
                    type="button"
                    disabled={busyId === testimony.id || testimony.moderationStatus === "pending"}
                    onClick={() => void perform(testimony.id, () => moderateTestimonyAction(testimony.id, "pending"))}
                  >
                    Keep pending
                  </button>
                  <button
                    className={styles.deleteTextButton}
                    type="button"
                    disabled={busyId === testimony.id || testimony.moderationStatus === "rejected"}
                    onClick={() => void perform(testimony.id, () => moderateTestimonyAction(testimony.id, "rejected"))}
                  >
                    Reject
                  </button>
                  {canPublish && testimony.moderationStatus === "approved" && testimony.publicationConsent && (
                    <button
                      className={styles.textButton}
                      type="button"
                      disabled={busyId === testimony.id}
                      onClick={() => void perform(testimony.id, () => setTestimonyPublishedAction(testimony.id, !testimony.published))}
                    >
                      {testimony.published ? "Unpublish" : "Publish"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>}
    </section>
  );
}
