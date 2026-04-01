"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-auth";
import type { Locale } from "@/lib/i18n";
import { getTexts } from "@/lib/i18n";

interface LoginFormProps {
  locale?: Locale;
}

export default function LoginForm({ locale = "en" }: LoginFormProps) {
  const t = getTexts(locale);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "/auth/callback";

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  const backHref = locale === "ko" ? "/ko" : "/";

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <div
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
          }}
        >
          ✉️
        </div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "0.75rem",
          }}
        >
          {t.auth.checkEmail}
        </h2>
        <p style={{ color: "#888", lineHeight: 1.6 }}>
          {t.auth.checkEmailDesc}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.auth.emailPlaceholder}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <p
          style={{
            color: "#f87171",
            fontSize: "0.875rem",
            marginBottom: "0.75rem",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          background: loading ? "#333" : "#fff",
          color: loading ? "#888" : "#000",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {loading ? t.auth.sending : t.auth.sendMagicLink}
      </button>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <a
          href={backHref}
          style={{ color: "#888", fontSize: "0.875rem", textDecoration: "none" }}
        >
          {t.auth.backLink}
        </a>
      </div>
    </form>
  );
}
