export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #333", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}
