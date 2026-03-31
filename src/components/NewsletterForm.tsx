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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError("");
        try {
          const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name: name || undefined }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error);
          } else {
            setSubmitted(true);
          }
        } catch {
          setError("네트워크 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      }}
      className="nl-form"
    >
      <input
        className="nl-input"
        type="text"
        placeholder={namePlaceholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="nl-input"
        type="email"
        placeholder={emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <p className="nl-error" style={{ color: "#ef4444", fontSize: "14px", margin: "4px 0 0" }}>{error}</p>}
      <button type="submit" className="nl-submit" disabled={loading}>
        {loading ? "..." : submitBtn}
      </button>
    </form>
  );
}
