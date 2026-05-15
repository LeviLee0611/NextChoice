-- pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- decisions 테이블에 embedding 컬럼 추가 (이미 존재하면 skip)
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 코사인 유사도 검색 인덱스
CREATE INDEX IF NOT EXISTS decisions_embedding_idx
ON decisions USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- 유사 결정 검색 RPC
CREATE OR REPLACE FUNCTION match_decisions(
  query_embedding vector(1536),
  p_user_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  chosen_option text,
  reason text,
  actual_result text,
  lesson_learned text,
  satisfaction_score int,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    d.id,
    d.title,
    d.category,
    d.chosen_option,
    d.reason,
    dr.actual_result,
    dr.lesson_learned,
    dr.satisfaction_score,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM decisions d
  LEFT JOIN decision_reviews dr ON dr.decision_id = d.id
  WHERE d.user_id = p_user_id
    AND d.embedding IS NOT NULL
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;
