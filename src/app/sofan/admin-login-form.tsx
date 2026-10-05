"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { loginAdminAction } from "./auth-actions";
import styles from "./admin-login.module.css";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await loginAdminAction(email, password);
    if (result.success) {
      window.location.reload();
      return;
    }
    setMessage(result.message);
    setBusy(false);
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard} aria-labelledby="admin-login-title">
        <Link href="/" className={styles.backButton}>← Back to website</Link>
        <span className={styles.brandMark} aria-hidden="true">S</span>
        <p className={styles.eyebrow}>SOFAN Administration</p>
        <h1 id="admin-login-title">Admin sign in</h1>
        <p>Sign in with your SOFAN admin account. Ask an existing administrator to create an account if you need access.</p>
        {!configured && (
          <p className={styles.setupNotice} role="status">
            Admin access is unavailable until Supabase Auth is configured and the user_roles migration has been applied.
          </p>
        )}
        <form onSubmit={submit}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
            disabled={!configured || busy}
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={1024}
            required
            disabled={!configured || busy}
          />
          {message && <p className={styles.error} role="alert">{message}</p>}
          <button type="submit"           disabled={!configured || busy || !email || !password}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
