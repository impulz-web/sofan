import type { Metadata } from "next";
import { connection } from "next/server";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { TestimonyForm } from "@/components/site/testimony-form";
import { loadPublicTestimonies } from "@/lib/public-testimonies";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Testimonies",
  description: "Read SOFAN testimonies approved for publication and submit your story for private review.",
};

export default async function TestimoniesPage() {
  await connection();
  const result = await loadPublicTestimonies();

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <p className="eyebrow eyebrow--terracotta">Testimony</p>
            <h1>Stories of faith and hope.</h1>
            <p>Public testimonies appear only after SOFAN reviews them and confirms permission to publish.</p>
          </div>
        </section>
        <section className={`container ${styles.content}`} aria-label="Testimonies">
          <div className={styles.published}>
            <h2>Published testimonies</h2>
            {result.status === "unavailable" ? (
              <p role="status">Published testimonies are temporarily unavailable. Please try again later.</p>
            ) : result.rows.length ? (
              <div className={styles.list}>
                {result.rows.map((testimony) => (
                  <article className={styles.card} key={testimony.id}>
                    <blockquote>{testimony.content}</blockquote>
                    <p>{testimony.isAnonymous ? "Shared anonymously" : testimony.displayName || "SOFAN community member"}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p role="status">
                {result.status === "not-configured"
                  ? "Testimonies will appear here after the site database is configured and a testimony is approved."
                  : "No testimonies have been approved for public sharing yet."}
              </p>
            )}
          </div>
          <TestimonyForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
