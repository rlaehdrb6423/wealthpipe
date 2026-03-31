import { type I18nTexts } from "@/lib/i18n"

interface TitlePattern {
  avgLength: number
  topWords: string[]
  titleTypes: { type: string; count: number }[]
  titles: string[]
  links: string[]
}

interface TitleAnalysisProps {
  titlePattern: TitlePattern
  t: I18nTexts["keyword"]
}

export default function TitleAnalysis({ titlePattern: tp, t }: TitleAnalysisProps) {
  const maxCount = Math.max(...tp.titleTypes.map((tt) => tt.count))

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-6">
      <h3 className="text-base font-semibold mb-4">{t.titleAnalysisTitle}</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#111] rounded-lg p-3 text-center">
          <p className="text-[#888] text-[11px] mb-1">{t.avgTitleLength}</p>
          <p className="text-lg font-bold">
            {tp.avgLength}
            <span className="text-xs text-[#888]">{t.charUnit}</span>
          </p>
        </div>
        <div className="bg-[#111] rounded-lg p-3 text-center">
          <p className="text-[#888] text-[11px] mb-1">{t.topTitleType}</p>
          <p className="text-sm font-bold">{tp.titleTypes[0]?.type || "-"}</p>
        </div>
        <div className="bg-[#111] rounded-lg p-3 text-center">
          <p className="text-[#888] text-[11px] mb-1">{t.topWords}</p>
          <p className="text-xs font-semibold text-[#ccc]">
            {tp.topWords.slice(0, 3).join(", ") || "-"}
          </p>
        </div>
      </div>

      <p className="text-[#888] text-xs mb-2">{t.titleTypeDistribution}</p>
      <div className="mb-4">
        {tp.titleTypes.map((tt) => (
          <div key={tt.type} className="flex items-center gap-2 mb-1.5">
            <span className="text-[#999] text-xs min-w-[60px]">{tt.type}</span>
            <div className="flex-1 bg-[#111] rounded h-4 overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] rounded transition-[width] duration-300"
                style={{ width: `${(tt.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-[#666] text-[11px] min-w-[20px]">{tt.count}</span>
          </div>
        ))}
      </div>

      <p className="text-[#888] text-xs mb-2">{t.topPostTitles}</p>
      <div>
        {tp.titles.map((title, i) => (
          <div key={i} className="flex gap-2 py-1.5 border-b border-[#111]">
            <span className="text-[#555] text-xs min-w-[20px]">{i + 1}</span>
            <a
              href={tp.links[i]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#ccc] leading-snug no-underline hover:text-[#3b82f6] transition-colors"
            >
              {title}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
