import { timingSafeEqual } from "crypto"

export function getClientIp(request: Request): string {
  const headers = request instanceof Request ? request.headers : null
  if (!headers) return "unknown"
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  )
}

export function verifyCronAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization") || ""
  const secret = process.env.CRON_SECRET || ""
  if (!secret || !authHeader) return false

  const expected = `Bearer ${secret}`
  if (authHeader.length !== expected.length) return false

  try {
    return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  } catch {
    return false
  }
}
