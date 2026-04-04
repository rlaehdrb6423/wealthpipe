import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis rate limiting — persistent across serverless cold starts
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Path-specific rate limiters (stricter)
const strictLimiters: Record<string, Ratelimit> = redis
  ? {
      "/api/contact": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:contact" }),
      "/api/newsletter": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:newsletter" }),
      "/api/keyword/trend": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "60 s"), prefix: "rl:trend" }),
      "/api/share/reward": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:reward" }),
      "/api/keyword": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:keyword" }),
      "/api/keyword-structure": new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:structure" }),
    }
  : {};

// Default API rate limiter
const defaultLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "60 s"), prefix: "rl:api" })
  : null;

async function checkRateLimit(ip: string, path: string): Promise<boolean> {
  if (!redis) return true; // Graceful fallback if Redis not configured

  const limiter = strictLimiters[path] || (path.startsWith("/api/") ? defaultLimiter : null);
  if (!limiter) return true;

  try {
    const { success } = await limiter.limit(ip);
    return success;
  } catch {
    return true; // Allow on Redis errors to avoid blocking legitimate traffic
  }
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-real-ip") || "unknown";
  const path = request.nextUrl.pathname;

  // CSRF: Origin 검증 for state-changing requests
  if ((request.method === "POST" || request.method === "DELETE" || request.method === "PUT" || request.method === "PATCH") && path.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "https://wealthpipe.net",
      "https://www.wealthpipe.net",
      process.env.NEXT_PUBLIC_SITE_URL,
    ].filter(Boolean);
    // Allow cron jobs (no origin header) and Stripe webhooks
    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin) && !path.startsWith("/api/stripe/webhook")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Rate limiting for API routes (Upstash Redis)
  if (path.startsWith("/api/")) {
    const allowed = await checkRateLimit(ip, path);
    if (!allowed) {
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
