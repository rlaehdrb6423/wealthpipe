import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const keyword = (searchParams.get("keyword") || "키워드").slice(0, 100)
  const volume = (searchParams.get("volume") || "0").replace(/[^0-9]/g, "").slice(0, 15)
  const competition = (searchParams.get("competition") || "보통").slice(0, 20)
  const competitionGrade = (searchParams.get("cg") || "C").slice(0, 2)
  const profit = (searchParams.get("profit") || "보통").slice(0, 20)
  const profitGrade = (searchParams.get("pg") || "C").slice(0, 2)
  const score = (searchParams.get("score") || "").replace(/[^0-9]/g, "").slice(0, 3)

  function gradeColor(grade: string) {
    if (grade === "A") return "#22c55e"
    if (grade === "B") return "#3b82f6"
    if (grade === "C") return "#eab308"
    if (grade === "D") return "#f97316"
    return "#ef4444"
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단 브랜딩 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              fontSize: "18px",
              fontWeight: 800,
              color: "#000",
            }}
          >
            W
          </div>
          <span style={{ color: "#888", fontSize: "20px" }}>WealthPipe 키워드 분석</span>
        </div>

        {/* 키워드 제목 */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "48px",
            lineHeight: 1.2,
          }}
        >
          {`"${keyword}"`}
        </div>

        {/* 지표 카드들 */}
        <div style={{ display: "flex", gap: "24px", flex: 1 }}>
          {/* 검색량 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#1a1a1a",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #333",
            }}
          >
            <span style={{ color: "#888", fontSize: "18px", marginBottom: "12px" }}>월간 검색량</span>
            <span style={{ color: "#fff", fontSize: "42px", fontWeight: 700 }}>
              {Number(volume).toLocaleString()}
            </span>
          </div>

          {/* 경쟁도 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#1a1a1a",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #333",
            }}
          >
            <span style={{ color: "#888", fontSize: "18px", marginBottom: "12px" }}>경쟁도</span>
            <span style={{ color: gradeColor(competitionGrade), fontSize: "42px", fontWeight: 700 }}>
              {competition}
            </span>
          </div>

          {/* 수익성 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#1a1a1a",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #333",
            }}
          >
            <span style={{ color: "#888", fontSize: "18px", marginBottom: "12px" }}>수익성</span>
            <span style={{ color: gradeColor(profitGrade), fontSize: "42px", fontWeight: 700 }}>
              {profit}
            </span>
          </div>
        </div>

        {/* 하단 CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px" }}>
          <span style={{ color: "#666", fontSize: "18px" }}>wealthpipe.net/tools/keyword</span>
          {score ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#888", fontSize: "16px" }}>기회점수</span>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: Number(score) >= 70 ? "#22c55e" : Number(score) >= 40 ? "#eab308" : "#ef4444",
                }}
              >
                {score}
              </span>
              <span style={{ color: "#666", fontSize: "14px" }}>/100</span>
            </div>
          ) : (
            <span style={{ color: "#888", fontSize: "16px" }}>무료로 분석해보세요 →</span>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
