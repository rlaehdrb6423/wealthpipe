import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// NOTE: In-memory rate limiting has limited effectiveness on Vercel (serverless).
// Each cold start gets a fresh Map. For production-grade rate limiting,
// consider Vercel KV, Upstash Redis, or Vercel's built-in WAF.
const rateLimitMap = new Map<string, { count: number; reset: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/contact": { max: 5, windowMs: 60_000 },
  "/api/newsletter": { max: 5, windowMs: 60_000 },
  "/api/keyword/trend": { max: 20, windowMs: 60_000 },
  "/api/share/reward": { max: 10, windowMs: 60_000 },
};

const DEFAULT_API_LIMIT = { max: 60, windowMs: 60_000 };

function checkRateLimit(ip: string, path: string): boolean {
  const limit = RATE_LIMITS[path] || (path.startsWith("/api/") ? DEFAULT_API_LIMIT : null);
  if (!limit) return true;

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (entry && now < entry.reset) {
    if (entry.count >= limit.max) return false;
    entry.count++;
  } else {
    rateLimitMap.set(key, { count: 1, reset: now + limit.windowMs });
  }

  if (rateLimitMap.size > 1_000) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.reset) rateLimitMap.delete(k);
    }
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const path = request.nextUrl.pathname;

  // Rate limiting for API routes
  if (path.startsWith("/api/")) {
    if (!checkRateLimit(ip, path)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Supabase auth session refresh — only for routes that need auth
  const AUTH_PATHS = ["/api/referral", "/api/watchlist", "/api/stripe", "/api/subscription", "/auth/callback", "/login", "/account"];
  const needsAuth = AUTH_PATHS.some((p) => path.startsWith(p));

  if (!needsAuth) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
