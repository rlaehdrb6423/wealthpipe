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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      onSubmit={async (e) => {
        e.preventDefault();
        if (!contact.name || !contact.email || !contact.msg) return;
        setLoading(true);
        setError("");
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: contact.name,
              email: contact.email,
              message: contact.msg,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error);
          } else {
            setSent(true);
          }
        } catch {
          setError("네트워크 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
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
      {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: "4px 0 0" }}>{error}</p>}
      <button type="submit" className="btn-w contact-submit" disabled={loading}>
        {loading ? "..." : submitBtn}
      </button>
    </form>
  );
}
