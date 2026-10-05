import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { MinistryResource } from "@/components/site/ministry-resource";
import { MinistryMediaLibrary } from "@/components/site/ministry-media-library";
import styles from "@/components/site/ministry-resource.module.css";
import { loadPublishedMedia } from "@/lib/public-ministry-content";

export const metadata: Metadata = {
  title: "Videos",
  description: "SOFAN's central library for sermons, prayer, teaching, ministry events, outreach, and testimonies.",
};

const categories = [
  ["Sermons", "/sermons"],
  ["Prayer", "/prayer-for-viewers"],
  ["Bible Teaching", null],
  ["Ministry Events", null],
  ["Outreach", "/charity"],
  ["Testimonies", "/testimonies"],
] as const;

export default async function VideosPage() {
  await connection();
  const result = await loadPublishedMedia();

  return (
    <MinistryResource
      eyebrow="Watch"
      title="SOFAN Videos"
      introduction={result.status === "ready"
        ? "A central place to find SOFAN sermons, prayer recordings, teaching, ministry events, outreach, and testimonies."
        : "A central place to find SOFAN ministry videos. No recordings are shown unless SOFAN has published them."}
    >
      {result.status === "ready" ? (
        <section className={`container ${styles.mediaSection}`} aria-label="Published SOFAN videos">
          <h2>Published videos</h2>
          <MinistryMediaLibrary
            items={result.rows}
            kind="all"
            emptyMessage="No videos have been published yet."
          />
        </section>
      ) : (
        <section className={`container ${styles.empty}`} role="status">
          <h2>Video library unavailable</h2>
          <p>
            {result.status === "not-configured"
              ? "The live video library is not connected yet. Published SOFAN recordings will appear here after the site database is configured."
              : "The live video library is temporarily unavailable. Please try again later."}
          </p>
        </section>
      )}
      <section className={`container ${styles.list}`} aria-label="Video categories">
        {categories.map(([category, href]) => (
          <article className={styles.card} key={category}>
            <div className={styles.cardBody}>
              <p className={styles.status}>SOFAN video category</p>
              <h2>{category}</h2>
              <p>Browse SOFAN&apos;s published video resources in this category.</p>
            </div>
            {href && (
              <Link className={styles.link} href={href}>
                Explore {category.toLowerCase()} <span aria-hidden="true">→</span>
              </Link>
            )}
          </article>
        ))}
      </section>
    </MinistryResource>
  );
}
