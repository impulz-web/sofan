import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import styles from "./ministry-resource.module.css";

export interface MinistryResourceItem {
  title: string;
  description: string;
  details?: string[];
  href?: string;
  actionLabel?: string;
  status?: string;
  imageUrl?: string;
}

function safeImageSource(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function MinistryResource({
  eyebrow,
  title,
  introduction,
  items,
  emptyMessage,
  children,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  items?: MinistryResourceItem[];
  emptyMessage?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <p className="eyebrow eyebrow--terracotta">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{introduction}</p>
          </div>
        </section>
        {children}
        {items && items.length > 0 ? (
          <section className={`container ${styles.list}`} aria-label={`${title} resources`}>
            {items.map((item) => {
                const imageSource = item.imageUrl ? safeImageSource(item.imageUrl) : null;
                return (
                  <article className={styles.card} key={item.title}>
                    {imageSource && (
                      <Image
                        className={styles.resourceImage}
                        src={imageSource}
                        alt=""
                        width={960}
                        height={540}
                        unoptimized
                        sizes="(max-width: 760px) 100vw, 50vw"
                      />
                    )}
                    <div className={styles.cardBody}>
                      {item.status && <p className={styles.status}>{item.status}</p>}
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                      {item.details && (
                        <ul className={styles.details}>
                          {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                        </ul>
                      )}
                    </div>
                    {item.href && (
                      <Link className={styles.link} href={item.href}>
                        {item.actionLabel ?? "Learn more"} <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </article>
                );
            })}
          </section>
        ) : emptyMessage ? (
          <section className={`container ${styles.empty}`} role="status">
            <h2>Nothing published yet</h2>
            <p>{emptyMessage}</p>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
