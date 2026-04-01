"use client";

import { useAuth } from "@/components/AuthProvider";
import { getTexts, type Locale } from "@/lib/i18n";

interface AuthNavProps {
  locale?: Locale;
}

export default function AuthNav({ locale = "en" }: AuthNavProps) {
  const { user, loading, signOut } = useAuth();
  const t = getTexts(locale);
  const loginHref = locale === "ko" ? "/ko/login" : "/login";

  if (loading) {
    return (
      <div
        style={{
          width: "80px",
          height: "32px",
          background: "#222",
          borderRadius: "6px",
        }}
      />
    );
  }

  if (!user) {
    return (
      <a
        href={loginHref}
        style={{
          padding: "0.35rem 0.9rem",
          background: "transparent",
          border: "1px solid #444",
          borderRadius: "6px",
          color: "#ccc",
          fontSize: "0.85rem",
          textDecoration: "none",
          fontWeight: 500,
          transition: "border-color 0.2s, color 0.2s",
        }}
      >
        {t.auth.loginBtn}
      </a>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span
        style={{
          color: "#888",
          fontSize: "0.8rem",
          maxWidth: "150px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {user.email}
      </span>
      <button
        onClick={signOut}
        style={{
          padding: "0.35rem 0.9rem",
          background: "transparent",
          border: "1px solid #444",
          borderRadius: "6px",
          color: "#ccc",
          fontSize: "0.85rem",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        {t.auth.logoutBtn}
      </button>
    </div>
  );
}
