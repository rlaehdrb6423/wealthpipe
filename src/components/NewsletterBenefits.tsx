interface NewsletterBenefitsProps {
  items: string[];
}

export default function NewsletterBenefits({ items }: NewsletterBenefitsProps) {
  return (
    <div className="nl-benefits">
      {items.map((item, i) => (
        <div key={i} className="nl-row">
          <span className="nl-dot" />
          <span className="nl-benefit-text">{item}</span>
        </div>
      ))}
    </div>
  );
}
