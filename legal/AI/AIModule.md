# Legal AI 모듈 구조 설명

이 문서는 `legal/AI` 폴더 내 각 모듈의 역할과 구성을 설명합니다.

---

## 📁 폴더 구조 개요

```
legal/AI/
├── AI_boon/          # 🏷️ 분쟁유형 분류 (BERT)
├── AI_jogi/          # ⚠️ 조기 위험 분석 (BERT + Gemini)
├── Ai_yusa/          # 🔍 유사 판례 검색 (FAISS)
├── total_ai/         # 🚀 통합 FastAPI 서버
├── Dockerfile        # Docker 빌드 파일
└── .gitignore
```

---

## 📦 AI_boon - 분쟁유형 분류

### 역할
KLUE-BERT 기반 법률 사건 유형 분류 모델 (97.6% 정확도)

### 구조
```
AI_boon/
├── 05-2_unified_system_comparison.ipynb  # 모델 비교 실험 노트북
├── final/                                 # 학습 완료된 BERT 모델
│   ├── config.json
│   ├── model.safetensors                  # 모델 가중치 (~442MB)
│   ├── tokenizer.json
│   ├── vocab.txt
│   └── label_encoder.pkl                  # 레이블 인코더
└── vector_store/                          # 벡터 저장소
```

### 분류 카테고리
| 코드 | 유형 | 설명 |
|------|------|------|
| 0 | 형사 | 형법 관련 사건 |
| 1 | 가사 | 가정법원 관할 사건 |
| 2 | 노동 | 근로/노동 관련 사건 |
| 3 | 기타 | 그 외 사건 유형 |

### 담당 기능
- 입력 텍스트 → 사건 유형 분류
- 신뢰도 점수 반환 (0.0 ~ 1.0)

---

## ⚠️ AI_jogi - 조기 위험 분석

### 역할
법률 사건의 위험도 예측 (승소율, 형량, 벌금, 위험도)

### 구조
```
AI_jogi/
├── lerning/                    # 학습 노트북
│   ├── deep_legal.ipynb       # 딥러닝 법률 분석
│   ├── machine_kisul.ipynb    # 머신러닝 기술 분석
│   └── machine_lagal.ipynb    # 머신러닝 법률 분석
│
├── llm/                        # LLM 연동 모듈
│   ├── main.py                # FastAPI 메인
│   ├── model.py               # MultiTaskBERT 모델
│   └── jem_api.py             # Gemini API 연동
│
├── pkl_file/                   # 학습된 모델 파일 (.pkl)
└── .gitignore
```

### 예측 항목
| 항목 | 설명 | 단위 |
|------|------|------|
| win_rate | 예상 승소율 | % |
| sentence | 예상 형량 | 년 |
| fine | 예상 벌금 | 원 |
| risk | 위험도 점수 | 0-100 |

### 담당 기능
- MultiTaskBERT: 4개 수치 동시 예측
- Gemini LLM: 상세 법률 피드백 생성

---

## 🔍 Ai_yusa - 유사 판례 검색

### 역할
FAISS 벡터 검색 기반 유사 판례 검색

### 구조
```
Ai_yusa/
├── app/                         # FastAPI 애플리케이션
│   ├── main.py                 # API 엔드포인트
│   ├── classifier.py           # 분류기 래퍼
│   ├── search_engine.py        # FAISS 검색 엔진
│   ├── service.py              # 비즈니스 로직
│   └── schemas.py              # Pydantic 스키마
│
├── llm/                         # LLM 모듈
├── notebooks/                   # 개발 노트북
│   ├── 01_dataset.ipynb        # 데이터셋 구축
│   ├── 02_embedding.ipynb      # 임베딩 생성
│   ├── 03_XAI.ipynb            # 설명 가능한 AI
│   └── 04_result.ipynb         # 결과 분석
└── src/                         # 소스 코드
```

### 주요 기능
- 판례 텍스트 → 벡터 임베딩 (sentence-transformers)
- FAISS 인덱스 기반 유사도 검색
- 유사 판례 Top-K 반환

---

## 🚀 total_ai - 통합 FastAPI 서버

### 역할
위 3개 모듈을 하나의 API 서버로 통합

### 구조
```
total_ai/
├── app/                # FastAPI 메인 앱
├── services/           # 비즈니스 로직
│   ├── classification/ # 분쟁유형 분류
│   ├── search/        # 유사 판례 검색
│   ├── risk/          # 위험도 분석
│   ├── early_warning/ # 조기 위험 감지
│   └── summary/       # LLM 요약
├── db/                 # 데이터베이스
├── models/             # 학습된 모델
├── data/               # 데이터 파일
└── docs/               # 문서
```

### API 엔드포인트
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/analyze` | 종합 분석 |
| POST | `/classify` | 사건 분류 |
| POST | `/risk` | 위험도 분석 |
| POST | `/early-warning` | 조기 위험 감지 |

> 📖 상세 문서: [total_ai/docs/](./total_ai/docs/)

---

## 🔗 모듈 간 관계

```
┌─────────────────────────────────────────────────────────┐
│                    total_ai (통합 서버)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  AI_boon    │ │  Ai_yusa    │ │  AI_jogi    │        │
│  │  (분류)     │ │  (검색)     │ │  (위험도)   │        │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘        │
│         │              │              │                │
│         ▼              ▼              ▼                │
│  ┌─────────────────────────────────────────────┐       │
│  │               services/ 모듈                 │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              React Frontend / Spring Backend
```

---

## ⚙️ Dockerfile

`legal/AI/Dockerfile`은 `total_ai` 폴더를 기반으로 컨테이너를 빌드합니다:

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY total_ai/requirements.txt .
RUN pip install -r requirements.txt
COPY total_ai/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 빌드 및 실행
```bash
cd legal/AI
docker build -t legal-ai .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key legal-ai
```

---

## 📝 개발 가이드

### 새 모듈 추가 시
1. `AI_[모듈명]/` 폴더 생성
2. 학습 코드는 `notebooks/` 또는 `lerning/`에
3. 모델 파일은 해당 폴더 내 저장
4. `total_ai/services/`에 서비스 래퍼 추가
5. `app/main.py`에 API 엔드포인트 추가

### 기존 모듈 수정 시
1. 개별 모듈(`AI_boon`, `AI_jogi`, `Ai_yusa`)에서 테스트
2. `total_ai/services/`의 래퍼 코드 업데이트
3. 통합 테스트 실행

---

## 📚 추가 문서

- [설치 가이드](./total_ai/docs/SETUP_GUIDE.md)
- [아키텍처 가이드](./total_ai/docs/ARCHITECTURE_GUIDE.md)
- [Ollama 설정](./total_ai/docs/OLLAMA_SETUP.md)
