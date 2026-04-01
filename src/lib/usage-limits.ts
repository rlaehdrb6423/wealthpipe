import { getServiceClient } from "@/lib/supabase"
import { FREE_LIMITS } from "@/lib/stripe"

export async function checkLimit(
  userId: string | null,
  ip: string,
  type: "keyword" | "structure"
): Promise<{ allowed: boolean; remaining: number; tier: string }> {
  // Logged-in user: check profile tier + referral bonus
  if (userId) {
    const supabase = getServiceClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, referral_bonus")
      .eq("id", userId)
      .single()

    const tier = profile?.tier ?? "free"

    if (tier === "pro" || tier === "business") {
      return { allowed: true, remaining: Infinity, tier }
    }

    // Free logged-in user: add referral bonus to daily limit
    const referralBonus = profile?.referral_bonus ?? 0
    const today = new Date().toISOString().split("T")[0]
    const dailyLimit = FREE_LIMITS[type] + referralBonus

    const { data } = await supabase
      .from("usage_limits")
      .select("count, bonus_count")
      .eq("ip_address", ip)
      .eq("date", today)
      .single()

    if (!data) return { allowed: true, remaining: dailyLimit - 1, tier: "free" }

    const totalAllowed = dailyLimit + (data.bonus_count || 0)
    if (data.count >= totalAllowed) return { allowed: false, remaining: 0, tier: "free" }

    return { allowed: true, remaining: totalAllowed - data.count - 1, tier: "free" }
  }

  // IP-based limit (non-logged-in or free tier)
  const supabase = getServiceClient()
  const today = new Date().toISOString().split("T")[0]
  const dailyLimit = FREE_LIMITS[type]

  const { data } = await supabase
    .from("usage_limits")
    .select("count, bonus_count")
    .eq("ip_address", ip)
    .eq("date", today)
    .single()

  if (!data) return { allowed: true, remaining: dailyLimit - 1, tier: userId ? "free" : "anonymous" }

  const totalAllowed = dailyLimit + (data.bonus_count || 0)
  if (data.count >= totalAllowed) return { allowed: false, remaining: 0, tier: userId ? "free" : "anonymous" }

  return {
    allowed: true,
    remaining: totalAllowed - data.count - 1,
    tier: userId ? "free" : "anonymous",
  }
}
