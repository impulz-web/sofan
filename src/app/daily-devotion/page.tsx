import type { Metadata } from "next";
import { connection } from "next/server";
import { MinistryResource } from "@/components/site/ministry-resource";
import { loadPublishedDevotions } from "@/lib/public-ministry-content";

export const metadata: Metadata = {
  title: "Daily Devotion",
  description: "Daily scripture, devotional messages, and prayer from SOFAN.",
};

function devotionDateLabel(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(date);
}

export default async function DailyDevotionPage() {
  await connection();
  const result = await loadPublishedDevotions();
  const introduction = result.status === "ready"
    ? "Read published SOFAN scripture reflections, prayers, and daily encouragement."
    : "Daily scripture, devotional messages, and prayer from SOFAN.";
  const emptyMessage = result.status === "not-configured"
    ? "The devotional library is not connected yet. Published devotions will appear here once the site database is configured."
    : result.status === "unavailable"
      ? "The devotional library is temporarily unavailable. Please try again later."
      : "There is no published devotion today. Check back when SOFAN has added an approved devotional.";

  return (
    <MinistryResource
      eyebrow="Daily Devotion"
      title="A moment in the Word."
      introduction={introduction}
      items={result.status === "ready"
        ? result.rows.map((devotion) => ({
            title: devotion.title,
            description: devotion.message,
            imageUrl: devotion.imageUrl ?? undefined,
            details: [
              devotion.scripture,
              devotionDateLabel(devotion.devotionDate),
              `Prayer: ${devotion.prayer}`,
            ],
            status: "Daily devotion",
          }))
        : []}
      emptyMessage={emptyMessage}
    />
  );
}
