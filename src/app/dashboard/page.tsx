import type { Metadata } from "next"
import { Suspense } from "react"
import DashboardClient from "@/components/DashboardClient"

export const metadata: Metadata = {
  title: "Dashboard — WealthPipe",
  description: "View your WealthPipe usage, subscription, and quick access to tools.",
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "#888", fontSize: 14 }}>Loading...</p>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  )
}
