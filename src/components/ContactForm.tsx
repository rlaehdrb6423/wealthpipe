"use client";

import { useState } from "react";

interface ContactFormProps {
  formLabel: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  msgPlaceholder: string;
  submitBtn: string;
  successTitle: string;
  successDesc: string;
}

export default function ContactForm({
  formLabel,
  namePlaceholder,
  emailPlaceholder,
  msgPlaceholder,
  submitBtn,
  successTitle,
  successDesc,
}: ContactFormProps) {
  const [contact, setContact] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="contact-success">
        <div className="contact-success-check">&#10003;</div>
        <p className="contact-success-title">{successTitle}</p>
        <p className="contact-success-desc">{successDesc}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (contact.name && contact.email && contact.msg) setSent(true);
      }}
      className="contact-form"
    >
      <p className="contact-form-label">{formLabel}</p>
      <input
        className="form-input"
        placeholder={namePlaceholder}
        value={contact.name}
        onChange={(e) => setContact({ ...contact, name: e.target.value })}
        required
      />
      <input
        className="form-input"
        type="email"
        placeholder={emailPlaceholder}
        value={contact.email}
        onChange={(e) => setContact({ ...contact, email: e.target.value })}
        required
      />
      <textarea
        className="form-input contact-textarea"
        placeholder={msgPlaceholder}
        rows={5}
        value={contact.msg}
        onChange={(e) => setContact({ ...contact, msg: e.target.value })}
        required
      />
      <button type="submit" className="btn-w contact-submit">
        {submitBtn}
      </button>
    </form>
  );
}
