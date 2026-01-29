# Legal AI 통합 시스템

기존 분산되어 있던 AI 모듈들을 하나의 FastAPI 서버로 통합한 시스템입니다.

## 📁 구조

```
unified_legal_ai/
├── app/                      # FastAPI 앱
│   ├── main.py              # 메인 서버
│   ├── config.py            # 환경 설정
│   └── schemas.py           # API 스키마
│
├── classifier/               # BERT 분류기
│   └── bert_classifier.py   # KLUE-BERT 통합
│
├── search/                   # 검색 엔진
│   └── faiss_engine.py      # FAISS 벡터 검색
│
├── llm/                      # LLM 모듈
│   ├── gemini_client.py     # Gemini API
│   ├── prompt_templates.py  # 프롬프트
│   └── summarizer.py        # 요약 생성
│
├── db/                       # 데이터베이스
│   ├── models.py            # SQLAlchemy 모델
│   ├── connection.py        # DB 연결
│   └── repository.py        # CRUD 작업
│
├── models/                   # 학습된 모델 (복사 필요)
│   └── bert_classifier/     # boonAI/final/ 복사
│
├── data/                     # 데이터 파일 (복사 필요)
│   ├── korean_precedents_embedded.parquet
│   ├── korean_precedents_clean.csv
│   └── case_index.faiss
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

## 🚀 실행 방법

### 방법 1: 로컬 실행

```bash
# 1. 디렉토리 이동
cd unified_legal_ai

# 2. 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 3. 의존성 설치
pip install -r requirements.txt

# 4. 환경 변수 설정
copy .env.example .env
# .env 파일에서 GEMINI_API_KEY 등 수정

# 5. 서버 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 방법 2: Docker 실행

```bash
# 1. 환경 변수 설정
copy .env.example .env
# .env 파일 수정

# 2. Docker Compose 실행
docker-compose up -d --build

# 3. 로그 확인
docker-compose logs -f api
```

## 📦 사전 준비

### 1. BERT 모델 복사

```bash
# boonAI/final/ 폴더를 models/bert_classifier/로 복사
xcopy /s /e "..\..\boonAI\final" "models\bert_classifier\"
```

### 2. 데이터 파일 복사 (Docker 사용 시)

```bash
# 또는 docker-compose.yml의 볼륨 경로 수정
mkdir data
copy "C:\LawAI\notebooks\korean_precedents_embedded.parquet" "data\"
copy "C:\LawAI\notebooks\korean_precedents_clean.csv" "data\"
copy "C:\LawAI\notebooks\case_index.faiss" "data\"
```

## 🔌 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 루트 (버전 정보) |
| GET | `/health` | 헬스체크 |
| POST | `/analyze` | 종합 분석 (분류 + 검색 + 요약) |
| POST | `/classify` | 사건 분류만 수행 |
| GET | `/case/{case_id}/summary` | 판례 요약 조회 |
| GET | `/case/{case_id}/full` | 판례 전문 조회 |

### 요청 예시

```bash
# 분석 요청
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"case_text": "임대인이 임차인의 계약 불이행으로 손해배상을 청구한 사건"}'
```

### 응답 예시

```json
{
  "overall_risk_level": "중간",
  "summary": "본 사건은 임대차 계약과 관련된 손해배상 청구로...",
  "similar_cases": [...],
  "classification": {
    "inferred_type": "민사",
    "confidence": 0.92,
    "label": "민사 사건 (계약/손해배상)",
    "all_probabilities": {...}
  }
}
```

## 🗄️ 데이터베이스 (선택사항)

DB 저장을 활성화하려면:

```bash
# .env 파일에서
USE_DATABASE=true
DATABASE_URL=postgresql://postgres:legalai123@localhost:5432/legal_ai
```

PostgreSQL + pgvector Docker 이미지 사용:

```bash
docker-compose up -d db  # DB만 먼저 실행
```

## 📝 통합된 모듈

1. **legal/AI/** - 기존 FastAPI + FAISS + Gemini
2. **boonAI/final/** - KLUE-BERT 사건 분류기 (97.6% 정확도)

## ⚠️ 주의사항

- GEMINI_API_KEY 환경 변수 필수
- 첫 실행 시 모델 다운로드로 시간 소요
- 데이터 파일 경로 확인 필요
