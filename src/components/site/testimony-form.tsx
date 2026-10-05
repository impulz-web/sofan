"use client";

import { useState, type FormEvent } from "react";
import styles from "./testimony-form.module.css";

export function TestimonyForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [publicationConsent, setPublicationConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/testimonies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, phone, content, isAnonymous, publicationConsent }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setIsError(true);
        setMessage(result?.error ?? "We couldn't submit your testimony. Please try again.");
        return;
      }
      setDisplayName("");
      setEmail("");
      setPhone("");
      setContent("");
      setIsAnonymous(false);
      setPublicationConsent(false);
      setMessage("Thank you. Your testimony was submitted privately for review; it will not be published automatically.");
    } catch {
      setIsError(true);
      setMessage("We couldn't submit your testimony. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h2>Share your testimony</h2>
      <p>Your submission is private while it is reviewed. Publication requires both admin approval and your permission.</p>
      <label>
        Name {!isAnonymous && <span>(required)</span>}
        <input
          name="displayName"
          autoComplete="name"
          value={displayName}
          disabled={isAnonymous || isSubmitting}
          required={!isAnonymous}
          maxLength={120}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </label>
      <div className={styles.contactFields}>
        <label>
          Email <span>(optional)</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            disabled={isAnonymous || isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          WhatsApp / phone <span>(optional)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={80}
            value={phone}
            disabled={isAnonymous || isSubmitting}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
      </div>
      <label>
        Testimony
        <textarea
          name="content"
          required
          rows={7}
          maxLength={10_000}
          value={content}
          disabled={isSubmitting}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={isAnonymous}
          disabled={isSubmitting}
          onChange={(event) => setIsAnonymous(event.target.checked)}
        />
        Submit anonymously
      </label>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={publicationConsent}
          disabled={isSubmitting}
          onChange={(event) => setPublicationConsent(event.target.checked)}
        />
        I give SOFAN permission to publish this testimony if an admin approves it.
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit Testimony"}
      </button>
      {message && <p className={styles.message} role={isError ? "alert" : "status"} aria-live="polite">{message}</p>}
    </form>
  );
}
