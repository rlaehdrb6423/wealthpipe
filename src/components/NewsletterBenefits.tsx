"use client";

interface NewsletterBenefitsProps {
  items: string[];
}

export default function NewsletterBenefits({ items }: NewsletterBenefitsProps) {
  return (
    <div className="nl-benefits">
      {items.map((item, i) => (
        <div
          key={i}
          className="nl-row"
          onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        >
          <span className="nl-dot" />
          <span className="nl-benefit-text">{item}</span>
        </div>
      ))}
    </div>
  );
}
