import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <h1 style={{ fontSize: 72, fontWeight: 900, marginBottom: 8 }}>404</h1>
        <p style={{ fontSize: 18, color: "#888", marginBottom: 32 }}>
          Page not found
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "#fff",
            color: "#000",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
