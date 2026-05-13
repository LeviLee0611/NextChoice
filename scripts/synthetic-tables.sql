-- ──────────────────────────────────────────────────────────────
-- 합성 데이터 테이블 (ML 학습용)
-- 삭제: DELETE FROM synthetic_personas;  → CASCADE로 전부 삭제됨
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS synthetic_personas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_type  TEXT    NOT NULL,   -- 'cautious_logical', 'bold_intuitive' 등
  persona_index INTEGER NOT NULL,   -- 같은 타입 내 인덱스 (0~19)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS synthetic_decisions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id      UUID    NOT NULL REFERENCES synthetic_personas(id) ON DELETE CASCADE,
  title           TEXT    NOT NULL,
  category        TEXT    NOT NULL,
  importance_level INTEGER NOT NULL CHECK (importance_level BETWEEN 1 AND 5),
  option_a        TEXT    NOT NULL,
  option_b        TEXT    NOT NULL,
  chosen_option   TEXT    NOT NULL CHECK (chosen_option IN ('A', 'B')),
  confidence      INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 10),
  gut_vs_logic    INTEGER NOT NULL CHECK (gut_vs_logic BETWEEN 1 AND 5),
  time_pressure   INTEGER NOT NULL CHECK (time_pressure BETWEEN 1 AND 3),
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS synthetic_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id      UUID    NOT NULL REFERENCES synthetic_decisions(id) ON DELETE CASCADE,
  persona_id       UUID    NOT NULL REFERENCES synthetic_personas(id) ON DELETE CASCADE,
  satisfaction_score INTEGER NOT NULL CHECK (satisfaction_score BETWEEN 1 AND 10),
  would_choose_again BOOLEAN NOT NULL,
  actual_result    TEXT    NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- anon/authenticated 접근 차단 (내부 ML 데이터)
ALTER TABLE synthetic_personas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE synthetic_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE synthetic_reviews   ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, INSERT, UPDATE, DELETE ON synthetic_personas  FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON synthetic_decisions FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON synthetic_reviews   FROM anon, authenticated;

-- ML 쿼리 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_syn_decisions_persona   ON synthetic_decisions(persona_id);
CREATE INDEX IF NOT EXISTS idx_syn_decisions_category  ON synthetic_decisions(category);
CREATE INDEX IF NOT EXISTS idx_syn_decisions_gl        ON synthetic_decisions(gut_vs_logic);
CREATE INDEX IF NOT EXISTS idx_syn_reviews_persona     ON synthetic_reviews(persona_id);
CREATE INDEX IF NOT EXISTS idx_syn_reviews_satisfaction ON synthetic_reviews(satisfaction_score);
