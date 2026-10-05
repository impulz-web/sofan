import type { Metadata } from "next";
import { connection } from "next/server";
import { MinistryResource } from "@/components/site/ministry-resource";
import { MinistryMediaLibrary } from "@/components/site/ministry-media-library";
import styles from "@/components/site/ministry-resource.module.css";
import { sermons } from "@/data/site";
import { loadPublishedMedia } from "@/lib/public-ministry-content";

export const metadata: Metadata = {
  title: "Sermons",
  description: "Explore SOFAN's listed sermons and find out when recordings become available.",
};

export default async function SermonsPage() {
  await connection();
  const result = await loadPublishedMedia({ kind: "sermon" });

  if (result.status === "ready") {
    return (
      <MinistryResource
        eyebrow="Word"
        title="Sermons"
        introduction="Explore published SOFAN messages and filter by topic."
      >
        <section className={`container ${styles.mediaSection}`} aria-label="Published sermons">
          <MinistryMediaLibrary
            items={result.rows}
            kind="sermon"
            emptyMessage="No sermons have been published yet."
          />
        </section>
      </MinistryResource>
    );
  }

  return (
    <MinistryResource
      eyebrow="Word"
      title="Sermons"
      introduction={result.status === "unavailable"
        ? "The published sermon library is temporarily unavailable. Existing listing information is shown below while the library reconnects."
        : "Messages currently listed by SOFAN. The live library is not connected yet, and recording links and topic labels have not been provided, so this page does not show broken or invented video links."}
      items={sermons.map((sermon) => ({
        title: sermon.title,
        description: `Speaker: ${sermon.speaker}`,
        details: [`Listed date: ${sermon.date}`],
        status: "Recording link not provided",
      }))}
      emptyMessage={result.status === "unavailable"
        ? "Please try again later to see the latest published sermons."
        : "The live sermon library is not connected yet. Existing listed sermons remain available above."}
    />
  );
}
