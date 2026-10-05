import Link from "next/link";

interface EventCardProps {
  date: string;
  title: string;
  time: string;
  description: string;
}

export function EventCard({ date, title, time, description }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__date">{date}</div>
      <div className="event-card__body">
        <h3>{title}</h3>
        <p className="event-card__time">{time}</p>
        <p>{description}</p>
        <Link href="/contact" className="text-link">
          Contact about this event <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
