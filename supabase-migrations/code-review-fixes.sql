-- 코드 리뷰 수정에 필요한 Supabase RPC 함수 및 제약 조건
-- Supabase Dashboard > SQL Editor에서 실행해주세요

-- 1. referrals 테이블에 unique 제약 추가 (중복 추천 방지)
ALTER TABLE referrals ADD CONSTRAINT referrals_referred_id_unique UNIQUE (referred_id);

-- 2. 추천 보너스 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_referral_bonus(user_id uuid, amount integer)
RETURNS void AS $$
  UPDATE profiles
  SET referral_bonus = COALESCE(referral_bonus, 0) + amount
  WHERE id = user_id;
$$ LANGUAGE sql;

-- 3. 사용량 카운터 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_usage_count(p_ip text, p_date text)
RETURNS void AS $$
  UPDATE usage_limits
  SET count = count + 1
  WHERE ip_address = p_ip AND date = p_date;
$$ LANGUAGE sql;

-- 4. 구조 분석 사용량 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_structure_usage_count(p_ip text, p_date text)
RETURNS void AS $$
  UPDATE structure_usage
  SET count = count + 1
  WHERE ip_address = p_ip AND date = p_date;
$$ LANGUAGE sql;

-- 5. 보너스 카운트 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_bonus_count(p_ip text, p_date text, p_amount integer)
RETURNS void AS $$
  UPDATE usage_limits
  SET bonus_count = COALESCE(bonus_count, 0) + p_amount
  WHERE ip_address = p_ip AND date = p_date;
$$ LANGUAGE sql;

-- 6. 만료 키워드 캐시 정리 (선택사항 - 수동 또는 pg_cron으로 실행)
-- DELETE FROM keyword_cache WHERE created_at < NOW() - INTERVAL '7 days';
