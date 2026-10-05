import Image from "next/image";

interface SermonCardProps {
  title: string;
  speaker: string;
  date: string;
  image: string;
  href: string;
  featured?: boolean;
}

export function SermonCard({ title, speaker, date, image, href, featured = false }: SermonCardProps) {
  return (
    <article className={`sermon-card ${featured ? "sermon-card--featured" : ""}`}>
      <div className="sermon-card__media">
        <Image src={image} alt={title} width={900} height={600} className="sermon-card__image" />
      </div>

      <div className="sermon-card__body">
        <div className="sermon-card__meta">
          <span>{speaker}</span>
          <span>{date}</span>
        </div>
        <h3>{title}</h3>
        <a href={href} className="sermon-card__link">
          Watch sermon <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
