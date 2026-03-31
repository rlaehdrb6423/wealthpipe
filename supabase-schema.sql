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
