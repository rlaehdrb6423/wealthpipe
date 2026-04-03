"use client"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
}

export default function Sparkline({ data, width = 120, height = 32 }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const isUp = data[data.length - 1] >= data[0]
  const color = isUp ? "#22c55e" : "#ef4444"

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(" ")

  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)
  const lastY = padding + (1 - (data[data.length - 1] - min) / range) * (height - padding * 2)

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  )
}
