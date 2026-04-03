-- Security Review Fixes (2026-04-03)

-- [S4] shares 테이블에 일일 중복 방지 unique index 추가
-- 동일 IP + keyword + platform + 날짜 조합이 중복되지 않도록 함
CREATE UNIQUE INDEX IF NOT EXISTS idx_shares_daily_unique
  ON shares (sharer_ip, keyword, platform, (created_at::date));

-- [S7] profiles 테이블에 referral_code 컬럼 추가 (예측 불가능한 코드)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 기존 유저에게 랜덤 referral_code 생성
UPDATE profiles SET referral_code = substr(md5(random()::text || id::text), 1, 10)
  WHERE referral_code IS NULL;

-- [L2] subscriptions 테이블에 user_id unique constraint 추가 (upsert용)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_unique
  ON subscriptions (user_id);

-- [L1] 키워드 사용량 원자적 체크+증가 RPC
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_ip TEXT,
  p_date DATE,
  p_daily_limit INTEGER DEFAULT 5
) RETURNS TABLE(allowed BOOLEAN, remaining INTEGER) AS $$
DECLARE
  current_count INTEGER;
  current_bonus INTEGER;
  total_allowed INTEGER;
BEGIN
  -- upsert: 없으면 생성
  INSERT INTO usage_limits (ip_address, date, count, bonus_count)
  VALUES (p_ip, p_date, 0, 0)
  ON CONFLICT (ip_address, date) DO NOTHING;

  -- 원자적 증가 + 현재 값 반환
  UPDATE usage_limits
  SET count = count + 1
  WHERE ip_address = p_ip AND date = p_date
  RETURNING count, bonus_count INTO current_count, current_bonus;

  total_allowed := p_daily_limit + COALESCE(current_bonus, 0);

  IF current_count > total_allowed THEN
    -- 초과했으므로 롤백 (count - 1)
    UPDATE usage_limits SET count = count - 1
    WHERE ip_address = p_ip AND date = p_date;
    RETURN QUERY SELECT FALSE, 0;
  ELSE
    RETURN QUERY SELECT TRUE, (total_allowed - current_count)::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- [L3] content_queue 동일 키워드 중복 방지 (pending/generating 상태)
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_queue_keyword_active
  ON content_queue (keyword) WHERE status IN ('pending', 'generating');
