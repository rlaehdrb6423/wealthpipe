import { getTexts } from "@/lib/i18n";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "로그인 - WealthPipe",
  description: "매직 링크로 WealthPipe에 로그인하세요.",
};

export default function KoLoginPage() {
  const t = getTexts("ko");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#111",
          border: "1px solid #222",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
        }}
      >
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <a
            href="/ko"
            style={{
              fontSize: "1.25rem",
              fontWeight: 900,
              color: "#fff",
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            WEALTHPIPE
          </a>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#fff",
              marginTop: "1.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {t.auth.loginTitle}
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {t.auth.loginDesc}
          </p>
        </div>

        <LoginForm locale="ko" />
      </div>
    </main>
  );
}
