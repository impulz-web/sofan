import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface MinistryCardProps {
  title: string;
  description: string;
  image: string;
  eyebrow?: ReactNode;
}

export function MinistryCard({ title, description, image, eyebrow }: MinistryCardProps) {
  return (
    <article className="ministry-card">
      <div className="ministry-card__image-wrap">
        <Image src={image} alt={title} width={800} height={900} className="ministry-card__image" />
      </div>
      <div className="ministry-card__body">
        {eyebrow ? <span className="card-kicker">{eyebrow}</span> : null}
        <h3>{title}</h3>
        <p>{description}</p>
        <Link href="/charity" aria-label={`Explore SOFAN outreach related to ${title}`}>
          Explore our outreach <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
