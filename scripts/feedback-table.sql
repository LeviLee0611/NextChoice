-- feedback 테이블 생성
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS feedback (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email   TEXT,
  category     TEXT        NOT NULL CHECK (category IN ('bug', 'feature', 'other')),
  title        TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  body         TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  status       TEXT        NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  admin_reply  TEXT,
  replied_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 로그인한 유저는 자기 피드백만 제출 가능
CREATE POLICY "Users can submit feedback"
  ON feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 유저는 자기 피드백만 조회 가능
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 관리자 페이지는 service role key로 RLS 우회
