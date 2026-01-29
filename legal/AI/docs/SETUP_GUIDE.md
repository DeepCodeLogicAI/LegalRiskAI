# Legal AI 통합 시스템 - 설치 및 사용 가이드

이 문서는 Legal AI 통합 시스템의 설치, 설정, 실행 방법을 안내합니다.

---

## 📋 목차

1. [사전 요구사항](#사전-요구사항)
2. [환경 설정](#환경-설정)
3. [로컬 실행](#로컬-실행)
4. [Docker 실행](#docker-실행)
5. [API 사용법](#api-사용법)
6. [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항

### 필수 소프트웨어

| 항목 | 최소 버전 | 권장 버전 |
|------|----------|----------|
| Python | 3.10+ | 3.10 |
| Docker | 20.10+ | 최신 |
| CUDA (선택) | 11.8+ | 12.0+ |

### 필수 API 키

- **GEMINI_API_KEY**: Google Gemini API 키 (LLM 요약 기능에 필수)

### 필요 데이터 파일

다음 파일들이 필요합니다 (기존 프로젝트에서 복사):

```
data/
├── index.faiss          # FAISS 인덱스 파일
└── index.pkl            # 임베딩 메타데이터
```

### 필요 모델 파일

```
models/
├── bert_classifier/     # KLUE-BERT 분류 모델
└── multi_task_bert/     # MultiTask BERT 모델
```

---

## 환경 설정

### 1단계: 환경 변수 파일 생성

```bash
# .env.example을 복사하여 .env 생성
copy .env.example .env     # Windows
# cp .env.example .env     # Linux/Mac
```

### 2단계: .env 파일 수정

```env
# Gemini API 키 (필수)
GEMINI_API_KEY=your_api_key_here

# 데이터베이스 (선택)
DATABASE_URL=postgresql://postgres:legalai123@localhost:5432/legal_ai
USE_DATABASE=false

# 데이터 파일 경로 (로컬 실행 시)
PARQUET_PATH=C:\LawAI\notebooks\korean_precedents_embedded.parquet
CSV_PATH=C:\LawAI\notebooks\korean_precedents_clean.csv
FAISS_INDEX_PATH=C:\LawAI\notebooks\case_index.faiss

# CORS 허용 origins
ALLOWED_ORIGINS=http://localhost:8484,http://localhost:3000,http://localhost:5173
```

---

## 로컬 실행

### 방법 1: 가상환경 사용 (권장)

```bash
# 1. total_ai 디렉토리로 이동
cd legal/AI/total_ai

# 2. 가상환경 생성
python -m venv venv

# 3. 가상환경 활성화
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Linux/Mac

# 4. 의존성 설치
pip install -r requirements.txt

# 5. 환경 변수 설정 (.env 파일 확인)

# 6. 서버 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 방법 2: 직접 실행

```bash
cd legal/AI/total_ai
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 실행 확인

서버가 정상 실행되면:

- **API 문서**: http://localhost:8000/docs
- **헬스체크**: http://localhost:8000/health
- **루트**: http://localhost:8000/

---

## Docker 실행

### 단일 컨테이너 실행

```bash
# 1. 이미지 빌드
docker build -t legal-ai .

# 2. 컨테이너 실행
docker run -d \
  --name legal-ai \
  -p 8000:8000 \
  -e GEMINI_API_KEY=your_key \
  -v ./data:/app/data \
  -v ./models:/app/models \
  legal-ai
```

### Docker Compose 실행 (권장)

```bash
# 1. 환경 변수 설정
copy .env.example .env
# .env 파일 수정

# 2. 빌드 및 실행
docker-compose up -d --build

# 3. 로그 확인
docker-compose logs -f api

# 4. 종료
docker-compose down
```

---

## API 사용법

### 기본 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/` | 버전 정보 |
| `GET` | `/health` | 헬스체크 |
| `POST` | `/analyze` | 종합 분석 |
| `POST` | `/classify` | 사건 분류 |
| `POST` | `/risk` | 위험도 분석 |
| `POST` | `/early-warning` | 조기 위험 감지 |
| `GET` | `/case/{case_id}/summary` | 판례 요약 |
| `GET` | `/case/{case_id}/full` | 판례 전문 |

### 요청 예시

#### 1. 종합 분석

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"case_text": "임대인이 임차인의 계약 불이행으로 손해배상을 청구한 사건"}'
```

**응답:**

```json
{
  "overall_risk_level": "중간",
  "summary": "본 사건은 임대차 계약과 관련된 손해배상 청구로...",
  "similar_cases": [...],
  "classification": {
    "inferred_type": "민사",
    "confidence": 0.92,
    "label": "민사 사건 (계약/손해배상)"
  }
}
```

#### 2. 사건 분류만

```bash
curl -X POST "http://localhost:8000/classify" \
  -H "Content-Type: application/json" \
  -d '{"case_text": "피고인이 음주운전을 하다가 교통사고를 일으킨 사건"}'
```

#### 3. 위험도 분석

```bash
curl -X POST "http://localhost:8000/risk" \
  -H "Content-Type: application/json" \
  -d '{"case_text": "피고인이 폭행을 당해 상해를 입은 사건"}'
```

---

## 트러블슈팅

### 자주 발생하는 문제

#### 1. "GEMINI_API_KEY not found"

```bash
# .env 파일에 키가 설정되어 있는지 확인
cat .env | grep GEMINI_API_KEY

# 환경 변수가 로드되는지 확인
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('GEMINI_API_KEY'))"
```

#### 2. "FAISS index not found"

```bash
# data 폴더에 index.faiss와 index.pkl 파일이 있는지 확인
ls data/
# 또는
dir data\
```

#### 3. "CUDA out of memory"

```python
# CPU 모드로 실행
import os
os.environ['CUDA_VISIBLE_DEVICES'] = ''
```

#### 4. 모델 로딩 시간이 오래 걸림

- 첫 실행 시 HuggingFace에서 모델을 다운로드합니다
- 인터넷 연결을 확인하세요
- 모델 캐시 경로: `~/.cache/huggingface/`

#### 5. CORS 에러

```bash
# .env 파일에서 프론트엔드 주소 추가
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://your-frontend-url
```

---

## 성능 최적화

### GPU 사용 (CUDA)

GPU를 사용하면 추론 속도가 크게 향상됩니다:

```bash
# CUDA 버전 확인
nvidia-smi

# PyTorch CUDA 지원 확인
python -c "import torch; print(torch.cuda.is_available())"
```

### 메모리 관리

- BERT 모델 로딩: ~2GB RAM
- FAISS 인덱스: 데이터 크기에 비례
- 동시 처리 수 제한 권장

---

## 다음 단계

- [아키텍처 가이드](./ARCHITECTURE_GUIDE.md): 폴더 구조 및 모듈 확장 방법
- [API 문서](http://localhost:8000/docs): 실시간 API 테스트
