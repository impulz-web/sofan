import type { Metadata } from "next";
import { connection } from "next/server";
import { MinistryResource } from "@/components/site/ministry-resource";
import { MinistryMediaLibrary } from "@/components/site/ministry-media-library";
import styles from "@/components/site/ministry-resource.module.css";
import { loadPublishedMedia } from "@/lib/public-ministry-content";

export const metadata: Metadata = {
  title: "Prayer for Viewers",
  description: "SOFAN video prayer resources. Videos will be added when ministry recordings are available.",
};

const prayerTopics = [
  "Morning Prayer",
  "Evening Prayer",
  "Prayer for Healing",
  "Prayer for Families",
  "Prayer for Open Doors",
  "Prayer Against Fear",
  "Prayer for Spiritual Growth",
];

export default async function PrayerForViewersPage() {
  await connection();
  const result = await loadPublishedMedia({ kind: "prayer_video" });

  if (result.status === "ready") {
    return (
      <MinistryResource
        eyebrow="Prayer"
        title="Prayer for Viewers"
        introduction="Find SOFAN video prayers by topic and watch published recordings."
      >
        <section className={`container ${styles.mediaSection}`} aria-label="Published prayer videos">
          <MinistryMediaLibrary
            items={result.rows}
            kind="prayer_video"
            emptyMessage="No prayer videos have been published yet."
          />
        </section>
      </MinistryResource>
    );
  }

  if (result.status === "unavailable") {
    return (
      <MinistryResource
        eyebrow="Prayer"
        title="Prayer for Viewers"
        introduction="The published prayer-video library is temporarily unavailable."
        emptyMessage="Please try again later to see SOFAN's published prayer videos."
      />
    );
  }

  return (
    <MinistryResource
      eyebrow="Prayer"
      title="Prayer for Viewers"
      introduction="The live prayer-video library is not connected yet. Choose a prayer topic below; published ministry recordings will appear when SOFAN adds them."
      items={prayerTopics.map((topic) => ({
        title: topic,
        description: "No video has been published for this topic yet.",
        status: "Video coming when available",
      }))}
      emptyMessage="No prayer videos have been published yet. The video library will be available once the site database is configured."
    />
  );
}
