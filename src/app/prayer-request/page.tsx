import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PrayerRequestForm } from "@/components/site/prayer-request-form";
import { contactInfo } from "@/data/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Prayer Request",
  description: "Share a written or voice prayer request with SOFAN in Juba, South Sudan.",
};

export default function PrayerRequestPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className="eyebrow eyebrow--terracotta">We&apos;re here to listen</p>
            <h1>Share your prayer request.</h1>
            <p className={styles.heroCopy}>
              Write a request or record a voice note directly in your browser. You can also reach us
              on WhatsApp if that feels easier.
            </p>
            <a className={styles.whatsappLink} href={contactInfo.whatsappUrl} target="_blank" rel="noreferrer">
              Message SOFAN on WhatsApp <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className={styles.content} aria-labelledby="request-form-heading">
          <div className={styles.formPanel}>
            <div className={styles.formHeading}>
              <h2 id="request-form-heading">Your prayer request</h2>
              <p>Share as much or as little as you are comfortable with.</p>
            </div>
            <PrayerRequestForm />
          </div>
          <p className={styles.privacyNote}>
            Recordings stay in your browser until you submit. You may include optional email or
            WhatsApp contact details, submit anonymously, and mark the request private. Every
            request remains admin-only and is never publicly displayed.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
