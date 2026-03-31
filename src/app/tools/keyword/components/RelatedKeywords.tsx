import { type I18nTexts } from "@/lib/i18n"

interface RelatedKeywordsProps {
  keywords: string[]
  onSelect: (kw: string) => void
  t: I18nTexts["keyword"]
}

export default function RelatedKeywords({ keywords, onSelect, t }: RelatedKeywordsProps) {
  if (keywords.length === 0) return null

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-6">
      <h3 className="text-base font-semibold mb-3">{t.relatedTitle}</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <button
            key={kw}
            onClick={() => onSelect(kw)}
            className="px-3.5 py-1.5 bg-[#111] border border-[#333] rounded-full text-[#ccc] text-sm cursor-pointer hover:border-[#555] transition-colors"
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  )
}
