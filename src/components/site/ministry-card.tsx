import Image from "next/image";
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
        <a href="#" aria-label={`Learn more about ${title}`}>
          Learn more <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
