"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { loginAdminAction } from "./auth-actions";
import styles from "./admin-login.module.css";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <h1 id="admin-login-title">Sign in</h1>
        <form onSubmit={submit} autoComplete="on">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
            disabled={busy}
          />
          <label htmlFor="admin-password">Password</label>
          <div className={styles.passwordField}>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={1024}
              required
              disabled={busy}
            />
            <button
              className={styles.passwordToggle}
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={busy}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {message && <p className={styles.error} role="alert">{message}</p>}
          <button type="submit" disabled={busy || !email || !password}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
