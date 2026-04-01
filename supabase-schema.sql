-- WealthPipe Phase 1 테이블 스키마

-- 1. 뉴스레터 구독자
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers (email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers (status);

-- 2. 키워드 캐시 (API 호출 절약용, 24시간 TTL)
CREATE TABLE keyword_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_keyword_cache_keyword ON keyword_cache (keyword);
CREATE INDEX idx_keyword_cache_created ON keyword_cache (created_at);

-- 3. 사용량 제한 (IP 기반 일일 제한)
CREATE TABLE usage_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  bonus_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ip_address, date)
);

CREATE INDEX idx_usage_ip_date ON usage_limits (ip_address, date);

-- 4. 문의 내역
CREATE TABLE contact_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 공유 추적
CREATE TABLE shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('kakao', 'twitter', 'copy')),
  sharer_ip TEXT,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shares_keyword ON shares (keyword);
CREATE INDEX idx_shares_created ON shares (created_at);

-- 6. AI 글 구조 캐시 (7일 TTL)
CREATE TABLE structure_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_structure_cache_keyword ON structure_cache (keyword);

-- 7. AI 글 구조 사용량 제한
CREATE TABLE structure_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ip_address, date)
);

CREATE INDEX idx_structure_usage_ip_date ON structure_usage (ip_address, date);

-- RLS 활성화
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE structure_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE structure_usage ENABLE ROW LEVEL SECURITY;

-- API Route(서버)에서 service_role 키로 접근하므로 anon 정책은 필요 없음
-- 클라이언트에서 직접 접근하는 테이블이 없으므로 RLS만 활성화해둠

-- 8. 블로그 포스트 (콘텐츠 허브)
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  locale TEXT DEFAULT 'ko' CHECK (locale IN ('ko', 'en')),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_slug ON blog_posts (slug);
CREATE INDEX idx_blog_published ON blog_posts (published, locale);
CREATE INDEX idx_blog_created ON blog_posts (created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 9. 경제 뉴스 다이제스트
CREATE TABLE news_digest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,  -- { articles: [{title, summary, source, category, url}], aiInsight: string }
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_news_digest_date ON news_digest (date DESC);
ALTER TABLE news_digest ENABLE ROW LEVEL SECURITY;

-- 10. 자산 시그널 (일일 시장 시그널 AI 분석)
CREATE TABLE asset_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_asset_signals_date ON asset_signals (date DESC);
ALTER TABLE asset_signals ENABLE ROW LEVEL SECURITY;

-- Supabase Auth profiles table (Phase 2: Auth)
-- Note: auth.users is auto-created by Supabase Auth

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business')),
  referral_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles (tier);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Phase 3: 구독 (Stripe 결제)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions (stripe_subscription_id);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Phase 5: 추천인(Referral) 시스템
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users,
  referred_email TEXT NOT NULL,
  referred_id UUID REFERENCES auth.users,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  bonus_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_referrals_referrer ON referrals (referrer_id);
CREATE INDEX idx_referrals_status ON referrals (status);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- 콘텐츠 생성 대기열
CREATE TABLE content_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  keyword_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  blog_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_queue_status ON content_queue (status);
CREATE INDEX idx_content_queue_created ON content_queue (created_at DESC);
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

-- 파이프라인 상태 (순환 인덱스 추적)
CREATE TABLE content_pipeline_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  current_index INTEGER DEFAULT 0,
  last_run_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE content_pipeline_state ENABLE ROW LEVEL SECURITY;
