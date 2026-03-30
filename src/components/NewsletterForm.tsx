"use client";

import { useState } from "react";

interface NewsletterFormProps {
  namePlaceholder: string;
  emailPlaceholder: string;
  submitBtn: string;
  successTitle: string;
  successDesc: string;
}

export default function NewsletterForm({
  namePlaceholder,
  emailPlaceholder,
  submitBtn,
  successTitle,
  successDesc,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="nl-success">
        <div className="nl-success-check">&#10003;</div>
        <p className="nl-success-title">{successTitle}</p>
        <p className="nl-success-desc">{successDesc}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setSubmitted(true);
      }}
      className="nl-form"
    >
      <input
        className="nl-input"
        type="text"
        placeholder={namePlaceholder}
      />
      <input
        className="nl-input"
        type="email"
        placeholder={emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="nl-submit">
        {submitBtn}
      </button>
    </form>
  );
}
