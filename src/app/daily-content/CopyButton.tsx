"use client"

import { useState } from "react"

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      style={{
        marginTop: 12,
        background: copied ? "#1a3a1a" : "#1a1a1a",
        border: `1px solid ${copied ? "#2a5a2a" : "#333"}`,
        color: "#fff",
        padding: "6px 16px",
        borderRadius: 6,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {copied ? "복사됨" : "복사"}
    </button>
  )
}
