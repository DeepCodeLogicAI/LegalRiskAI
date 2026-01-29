# db/init.sql
-- PostgreSQL 초기화 스크립트
-- docker-compose에서 자동 실행

-- pgvector 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;

-- 판례 테이블
CREATE TABLE IF NOT EXISTS precedents (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    case_name VARCHAR(500),
    court_name VARCHAR(100),
    case_type VARCHAR(50),
    decision_type VARCHAR(50),
    case_text TEXT,
    embedding VECTOR(768),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 분석 결과 테이블
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    input_text TEXT NOT NULL,
    inferred_case_type VARCHAR(50),
    case_type_confidence FLOAT,
    overall_risk_level VARCHAR(20),
    summary TEXT,
    similar_case_ids TEXT[],
    full_response JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_precedents_case_type ON precedents(case_type);
CREATE INDEX IF NOT EXISTS idx_precedents_case_number ON precedents(case_number);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_results(created_at DESC);

-- 벡터 검색 인덱스 (데이터 삽입 후 실행 권장)
-- CREATE INDEX IF NOT EXISTS idx_precedents_embedding ON precedents 
--     USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

COMMENT ON TABLE precedents IS '판례 데이터';
COMMENT ON TABLE analysis_results IS '분석 결과 저장';
