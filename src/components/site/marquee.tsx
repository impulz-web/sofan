interface MarqueeProps {
  items: string[];
}

export function Marquee({ items }: MarqueeProps) {
  const content = [...items, ...items, ...items];

  return (
    <div className="marquee-wrap" aria-label="Church welcome message">
      <div className="marquee-track">
        {content.map((item, index) => (
          <span key={`${item}-${index}`} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
