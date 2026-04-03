-- 매일 자동 생성되는 마케팅 콘텐츠 (네이버블로그, 워드프레스, 쓰레드, X)
CREATE TABLE daily_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  keyword_data JSONB,
  platform TEXT NOT NULL CHECK (platform IN ('naver_blog', 'wordpress', 'threads', 'x')),
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  wp_post_id INTEGER,
  wp_post_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_daily_content_platform ON daily_content (platform);
CREATE INDEX idx_daily_content_created ON daily_content (created_at DESC);
ALTER TABLE daily_content ENABLE ROW LEVEL SECURITY;
