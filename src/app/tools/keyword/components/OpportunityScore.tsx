import { type I18nTexts } from "@/lib/i18n"

function scoreColor(score: number) {
  if (score >= 80) return "#22c55e"
  if (score >= 60) return "#3b82f6"
  if (score >= 40) return "#eab308"
  return "#ef4444"
}

function scoreGrade(score: number) {
  if (score >= 80) return "A"
  if (score >= 60) return "B"
  if (score >= 40) return "C"
  return "E"
}

interface OpportunityScoreProps {
  opportunityScore: number
  verdictKey: string
  verdict: string
  t: I18nTexts["keyword"]
}

export default function OpportunityScore({ opportunityScore, verdictKey, verdict, t }: OpportunityScoreProps) {
  const color = scoreColor(opportunityScore)
  const bgAlpha =
    opportunityScore >= 80
      ? "rgba(34,197,94,0.15)"
      : opportunityScore >= 60
      ? "rgba(59,130,246,0.15)"
      : opportunityScore >= 40
      ? "rgba(234,179,8,0.15)"
      : "rgba(239,68,68,0.15)"

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[#888] text-xs font-semibold tracking-widest">{t.opportunityScore}</span>
        <span className="text-3xl font-bold" style={{ color }}>
          {opportunityScore}
        </span>
      </div>
      <div className="bg-[#111] rounded-md h-3 overflow-hidden mb-3">
        <div
          className="h-full rounded-md transition-[width] duration-500"
          style={{ width: `${opportunityScore}%`, background: color }}
        />
      </div>
      <div
        className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ background: bgAlpha, color }}
      >
        {t[verdictKey as keyof typeof t] || verdict}
      </div>
    </div>
  )
}
