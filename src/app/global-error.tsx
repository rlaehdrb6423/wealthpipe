"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>Error</h1>
            <p style={{ fontSize: 16, color: "#888", marginBottom: 32 }}>
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 32px",
                background: "#fff",
                color: "#000",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
