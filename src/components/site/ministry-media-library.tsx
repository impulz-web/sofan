"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { MinistryMediaItem } from "@/lib/admin-types";
import styles from "./ministry-media-library.module.css";

const sermonTopics = [
  "Faith",
  "Prayer",
  "Jesus",
  "Family",
  "Spiritual Growth",
  "Encouragement",
  "Bible Teaching",
];

const prayerTopics = [
  "Morning Prayer",
  "Evening Prayer",
  "Prayer for Healing",
  "Prayer for Families",
  "Prayer for Open Doors",
  "Prayer Against Fear",
  "Prayer for Spiritual Growth",
];

const videoTopics = [
  "Sermons",
  "Prayer",
  "Bible Teaching",
  "Ministry Events",
  "Outreach",
  "Testimonies",
];

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  return safeHttpUrl(value);
}

function dateLabel(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function MinistryMediaLibrary({
  items,
  kind,
  emptyMessage,
}: {
  items: MinistryMediaItem[];
  kind: MinistryMediaItem["kind"] | "all";
  emptyMessage: string;
}) {
  const categories = useMemo(
    () => {
      const initialCategories = kind === "sermon"
        ? sermonTopics
        : kind === "prayer_video"
          ? prayerTopics
          : kind === "all"
            ? videoTopics
            : [];
      return [...new Set([
        ...initialCategories,
        ...items
          .map((item) => item.category?.trim())
          .filter((category): category is string => Boolean(category && category !== "All")),
      ])];
    },
    [kind, items],
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const visibleItems = selectedCategory === "All"
    ? items
    : items.filter((item) => {
        if (selectedCategory === "Sermons") return item.kind === "sermon";
        if (selectedCategory === "Prayer") return item.kind === "prayer_video";
        return item.category?.toLocaleLowerCase() === selectedCategory.toLocaleLowerCase();
      });

  return (
    <section className={styles.library} aria-label="Video resources">
      {categories.length > 0 && (
        <nav className={styles.filters} aria-label="Filter video resources by topic">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              className={selectedCategory === category ? styles.filterActive : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      )}
      {visibleItems.length === 0 ? (
        <p className={styles.empty} role="status">
          {items.length > 0
            ? `No published videos are filed under ${selectedCategory}.`
            : emptyMessage}
        </p>
      ) : (
        <div className={styles.grid}>
          {visibleItems.map((item) => {
            const videoUrl = safeHttpUrl(item.videoUrl);
            const thumbnailUrl = item.thumbnailUrl ? safeImageUrl(item.thumbnailUrl) : null;
            const mediaDate = dateLabel(item.mediaDate);
            return (
              <article className={styles.card} key={item.id}>
                {thumbnailUrl && (
                  <Image
                    className={styles.thumbnail}
                    src={thumbnailUrl}
                    alt=""
                    width={640}
                    height={360}
                    unoptimized
                  />
                )}
                <div className={styles.cardBody}>
                  <p className={styles.category}>
                    {item.category || (item.kind === "sermon" ? "Sermon" : item.kind === "prayer_video" ? "Prayer" : "Ministry video")}
                  </p>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  {(item.speaker || item.mediaDate || item.scripture) && (
                    <ul className={styles.meta}>
                      {item.speaker && <li>{item.speaker}</li>}
                      {mediaDate && <li>{mediaDate}</li>}
                      {item.scripture && <li>{item.scripture}</li>}
                    </ul>
                  )}
                  {videoUrl ? (
                    <a href={videoUrl} target="_blank" rel="noreferrer">
                      Watch video <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <p className={styles.unavailable}>Video link unavailable</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
