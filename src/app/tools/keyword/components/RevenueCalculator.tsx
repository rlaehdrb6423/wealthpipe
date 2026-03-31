"use client"

import { type I18nTexts } from "@/lib/i18n"

function fmt(n: number) {
  return n.toLocaleString("ko-KR")
}

interface RevenueCalculatorProps {
  totalVolume: number
  pcCpc: number
  mobileCpc: number
  avgCpc: number
  avgCtr: number
  revenueConservative: number
  revenueRealistic: number
  revenueOptimistic: number
  shareRate: number
  onShareRateChange: (v: number) => void
  t: I18nTexts["keyword"]
}

export default function RevenueCalculator({
  totalVolume,
  pcCpc,
  mobileCpc,
  avgCpc,
  avgCtr,
  revenueConservative,
  revenueRealistic,
  revenueOptimistic,
  shareRate,
  onShareRateChange,
  t,
}: RevenueCalculatorProps) {
  const estimated = Math.round(totalVolume * (avgCtr / 100) * avgCpc * (shareRate / 100))

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-6">
      <h3 className="text-base font-semibold mb-4">{t.revenueTitle}</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex justify-between py-2 border-b border-[#111]">
          <span className="text-[#888] text-sm">{t.pcCpc}</span>
          <span className="text-sm font-medium">₩{fmt(pcCpc)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[#111]">
          <span className="text-[#888] text-sm">{t.mobileCpc}</span>
          <span className="text-sm font-medium">₩{fmt(mobileCpc)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[#111]">
          <span className="text-[#888] text-sm">{t.avgCpc}</span>
          <span className="text-sm font-medium">₩{fmt(avgCpc)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#111] rounded-lg p-3 text-center">
          <p className="text-[#888] text-[11px] mb-1">{t.revenueConservative}</p>
          <p className="text-base font-bold text-[#888]">₩{fmt(revenueConservative)}</p>
        </div>
        <div className="bg-[#111] rounded-lg p-3 text-center border border-[#22c55e]">
          <p className="text-[#22c55e] text-[11px] mb-1">{t.revenueRealistic}</p>
          <p className="text-xl font-bold text-[#22c55e]">₩{fmt(revenueRealistic)}</p>
        </div>
        <div className="bg-[#111] rounded-lg p-3 text-center">
          <p className="text-[#888] text-[11px] mb-1">{t.revenueOptimistic}</p>
          <p className="text-base font-bold text-[#3b82f6]">₩{fmt(revenueOptimistic)}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-[#888] text-sm">{t.shareRate}</span>
          <span className="text-sm font-semibold">{shareRate}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={shareRate}
          onChange={(e) => onShareRateChange(Number(e.target.value))}
          className="w-full accent-[#22c55e]"
        />
        <div className="bg-[#111] rounded-lg p-3 text-center mt-2">
          <p className="text-[#888] text-[11px] mb-0.5">
            {t.estimatedMonthlyRevenue} ({shareRate}%)
          </p>
          <p className="text-2xl font-bold text-[#22c55e]">₩{fmt(estimated)}</p>
        </div>
      </div>
      <p className="text-[#555] text-[11px]">{t.revenueDisclaimer}</p>
    </div>
  )
}
