"use client"

import { type Locale, type I18nTexts } from "@/lib/i18n"

interface AiStructureData {
  h1: string
  h2: string[]
  lsiKeywords: string[]
  recommendedLength: number
  tip: string
}

interface AiStructureProps {
  aiStructure: AiStructureData | null
  aiLoading: boolean
  aiError: string
  onFetch: () => void
  locale: Locale
  t: I18nTexts["keyword"]
}

export default function AiStructure({
  aiStructure,
  aiLoading,
  aiError,
  onFetch,
  locale,
  t,
}: AiStructureProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold">{t.aiStructureTitle}</h3>
        <span className="text-[#555] text-[11px]">{t.aiStructureLimit}</span>
      </div>

      {!aiStructure && !aiLoading && (
        <button
          onClick={onFetch}
          className="w-full p-3 border border-[#333] rounded-lg text-white text-sm font-semibold cursor-pointer"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
        >
          {t.aiStructureBtn}
        </button>
      )}

      {aiLoading && (
        <div className="text-center p-5 text-[#888]">
          <span
            className="inline-block w-5 h-5 border-2 border-[#333] border-t-[#3b82f6] rounded-full mr-2 align-middle"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          {t.aiStructureLoading}
        </div>
      )}

      {aiError && <p className="text-[#ef4444] text-[13px] mt-2">{aiError}</p>}

      {aiStructure && (
        <div className="mt-1">
          <div className="mb-3">
            <p className="text-[#888] text-[11px] mb-1">{t.aiStructureH1}</p>
            <p className="text-[15px] font-semibold text-white bg-[#111] px-3.5 py-2.5 rounded-lg">
              {aiStructure.h1}
            </p>
          </div>
          <div className="mb-3">
            <p className="text-[#888] text-[11px] mb-1.5">{t.aiStructureH2}</p>
            {aiStructure.h2.map((h, i) => (
              <div key={i} className="flex gap-2 items-center py-1.5 border-b border-[#111]">
                <span className="text-[#3b82f6] text-xs font-semibold min-w-[24px]">H2</span>
                <span className="text-[13px] text-[#ccc]">{h}</span>
              </div>
            ))}
          </div>
          <div className="mb-3">
            <p className="text-[#888] text-[11px] mb-1.5">{t.aiStructureLsi}</p>
            <div className="flex flex-wrap gap-1.5">
              {aiStructure.lsiKeywords.map((k, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#111] border border-[#333] rounded-2xl text-xs text-[#aaa]"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-[#111] rounded-lg p-2.5 text-center">
              <p className="text-[#888] text-[11px] mb-0.5">{t.aiStructureLength}</p>
              <p className="text-[15px] font-semibold">
                {aiStructure.recommendedLength.toLocaleString()}
                {locale === "ko" ? "자" : " chars"}
              </p>
            </div>
          </div>
          <div className="bg-[#111] rounded-lg p-3">
            <p className="text-[#888] text-[11px] mb-1">{t.aiStructureTip}</p>
            <p className="text-[13px] text-[#ccc] leading-relaxed">{aiStructure.tip}</p>
          </div>
        </div>
      )}
    </div>
  )
}
