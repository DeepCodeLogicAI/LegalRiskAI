# Legal AI 통합 시스템 - 아키텍처 가이드

이 문서는 각 폴더의 역할과 새로운 기능을 추가하는 방법을 설명합니다.

---

## 📋 목차

1. [전체 구조 개요](#전체-구조-개요)
2. [폴더별 상세 설명](#폴더별-상세-설명)
3. [새 기능 추가 방법](#새-기능-추가-방법)
4. [코드 컨벤션](#코드-컨벤션)
5. [확장 예시](#확장-예시)

---

## 전체 구조 개요

```
total_ai/
├── app/                    # 🚀 FastAPI 메인 애플리케이션
│   ├── main.py            # API 엔드포인트 정의
│   ├── config.py          # 환경 설정 관리
│   └── schemas.py         # Pydantic 요청/응답 스키마
│
├── classifier/             # 🏷️ BERT 분류기 (레거시)
│   ├── bert_classifier.py # KLUE-BERT 분류
│   └── ollama_classifier.py # Ollama LLM 분류
│
├── services/              # 💼 비즈니스 로직 서비스
│   ├── classification/    # 분쟁유형 분류
│   ├── search/           # 유사 판례 검색
│   ├── risk/             # 위험도 분석
│   ├── early_warning/    # 조기 위험 감지
│   └── summary/          # LLM 요약
│
├── search/                # 🔍 검색 엔진 (레거시)
│   └── faiss_engine.py   # FAISS 벡터 검색
│
├── llm/                   # 🤖 LLM 모듈 (레거시)
│   ├── gemini_client.py  # Gemini API 클라이언트
│   ├── prompt_templates.py # 프롬프트 템플릿
│   └── summarizer.py     # 요약 생성기
│
├── db/                    # 💾 데이터베이스
│   ├── models.py         # SQLAlchemy 모델
│   ├── connection.py     # DB 연결 관리
│   └── repository.py     # CRUD 작업
│
├── models/                # 📦 학습된 모델 파일
│   ├── bert_classifier/  # KLUE-BERT 모델
│   └── multi_task_bert/  # MultiTask BERT 모델
│
├── data/                  # 📊 데이터 파일
│   ├── index.faiss       # FAISS 인덱스
│   └── index.pkl         # 임베딩 메타데이터
│
└── docs/                  # 📖 문서
    ├── SETUP_GUIDE.md    # 설치 가이드
    └── ARCHITECTURE_GUIDE.md # 이 문서
```

---

## 폴더별 상세 설명

### 📂 app/ - FastAPI 애플리케이션

API 서버의 핵심 코드가 위치합니다.

| 파일 | 역할 |
|------|------|
| `main.py` | 모든 API 엔드포인트 정의, 앱 생명주기 관리 |
| `config.py` | 환경 변수 로딩, 설정 클래스 |
| `schemas.py` | 요청/응답 데이터 검증 스키마 |

---

### 📂 services/ - 비즈니스 로직

모든 AI 서비스가 모듈화되어 있습니다.

#### services/classification/ - 분쟁유형 분류

```
classification/
├── __init__.py            # get_classifier, get_ollama_classifier 내보내기
├── bert_classifier.py     # KLUE-BERT 기반 분류 (97.6% 정확도)
└── ollama_classifier.py   # Qwen2.5:7b LLM 기반 분류
```

**담당**: 입력 텍스트의 법률 사건 유형 분류

---

#### services/search/ - 유사 판례 검색

```
search/
├── __init__.py       # get_search_engine 내보내기
├── faiss_engine.py   # FAISS 벡터 검색 엔진
├── core_ai.py        # 검색 코어 로직
└── service.py        # 검색 서비스 래퍼
```

**담당**: 입력 텍스트와 유사한 판례 검색

---

#### services/risk/ - 위험도 분석

```
risk/
├── __init__.py        # LegalAnalyzer 내보내기
└── risk_analyzer.py   # 법률 위험도 분석 (BERT + Gemini)
```

**담당**: 승소율, 형량, 벌금, 위험도 예측

---

#### services/early_warning/ - 조기 위험 감지

```
early_warning/
├── __init__.py            # MultiTaskLegalBERT 내보내기
└── multi_task_model.py    # 4개 수치 예측 모델
```

**담당**: 빠른 위험도 수치 예측 (Gemini 없이)

---

#### services/summary/ - LLM 요약

```
summary/
├── __init__.py           # 내보내기
├── gemini_client.py      # Gemini API 클라이언트
├── prompt_templates.py   # 프롬프트 템플릿
└── summarizer.py         # 요약 생성기
```

**담당**: Gemini를 활용한 분석 결과 요약

---

### 📂 db/ - 데이터베이스

```
db/
├── models.py       # SQLAlchemy ORM 모델 정의
├── connection.py   # 데이터베이스 연결 풀 관리
├── repository.py   # CRUD 작업 (Repository 패턴)
└── init.sql        # 초기 테이블 생성 SQL
```

**담당**: 분석 결과 저장 및 조회 (선택 기능)

---

### 📂 models/ - 학습된 모델

```
models/
├── bert_classifier/       # KLUE-BERT 분류 모델
│   ├── config.json
│   ├── model.safetensors
│   └── tokenizer files...
│
└── multi_task_bert/       # MultiTask BERT 모델
    └── ...
```

> ⚠️ 이 폴더의 파일들은 Git에 포함되지 않습니다.  
> 별도로 복사하거나 HuggingFace에서 다운로드 필요

---

### 📂 data/ - 데이터 파일

```
data/
├── index.faiss    # FAISS 벡터 인덱스 (~7MB)
└── index.pkl      # 인덱스 메타데이터 (~9MB)
```

> ⚠️ 이 파일들도 Git에 포함되지 않습니다.

---

## 새 기능 추가 방법

### 🆕 새로운 AI 서비스 추가

#### Step 1: 서비스 폴더 생성

```bash
mkdir services/new_feature
```

#### Step 2: 서비스 파일 작성

```python
# services/new_feature/analyzer.py

class NewFeatureAnalyzer:
    """새로운 기능 분석기"""
    
    def __init__(self):
        # 모델 로드 등 초기화
        pass
    
    def analyze(self, text: str) -> dict:
        """분석 수행"""
        result = {
            "score": 0.85,
            "category": "example"
        }
        return result
```

#### Step 3: __init__.py 작성

```python
# services/new_feature/__init__.py

from .analyzer import NewFeatureAnalyzer

_analyzer = None

def get_analyzer():
    global _analyzer
    if _analyzer is None:
        _analyzer = NewFeatureAnalyzer()
    return _analyzer
```

#### Step 4: 부모 __init__.py 수정

```python
# services/__init__.py

# 기존 import들...
from .new_feature import get_analyzer
```

#### Step 5: API 엔드포인트 추가

```python
# app/main.py

from services.new_feature import get_analyzer

@app.post("/new-feature")
async def new_feature_endpoint(request: AnalyzeRequest):
    """새로운 기능 API"""
    analyzer = get_analyzer()
    result = analyzer.analyze(request.case_text)
    return result
```

---

### 🆕 새로운 스키마 추가

```python
# app/schemas.py

from pydantic import BaseModel

class NewFeatureRequest(BaseModel):
    """새 기능 요청 스키마"""
    text: str
    options: dict = {}

class NewFeatureResponse(BaseModel):
    """새 기능 응답 스키마"""
    score: float
    category: str
    details: list = []
```

---

### 🆕 새로운 모델 추가

#### Step 1: models 폴더에 모델 파일 배치

```
models/
└── new_model/
    ├── config.json
    ├── model.safetensors
    └── tokenizer.json
```

#### Step 2: 서비스에서 모델 로드

```python
# services/new_feature/analyzer.py

from transformers import AutoModel, AutoTokenizer
import os

class NewFeatureAnalyzer:
    def __init__(self):
        model_path = os.path.join(
            os.path.dirname(__file__),
            "../../models/new_model"
        )
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModel.from_pretrained(model_path)
```

---

## 코드 컨벤션

### 파일 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 서비스 클래스 | PascalCase | `LegalAnalyzer` |
| 함수 | snake_case | `get_analyzer()` |
| 파일 | snake_case | `risk_analyzer.py` |
| 상수 | UPPER_SNAKE | `MAX_LENGTH = 512` |

### 폴더 구조 규칙

```
services/[feature_name]/
├── __init__.py         # 공개 API 내보내기
├── [main_class].py     # 메인 클래스
├── utils.py            # 유틸리티 함수 (선택)
└── constants.py        # 상수 정의 (선택)
```

### 싱글톤 패턴

모든 서비스는 싱글톤 패턴을 사용합니다:

```python
_instance = None

def get_service():
    global _instance
    if _instance is None:
        _instance = ServiceClass()
    return _instance
```

---

## 확장 예시

### 예시 1: 새로운 LLM 제공자 추가

```python
# services/summary/claude_client.py

import anthropic

class ClaudeClient:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def summarize(self, text: str) -> str:
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1024,
            messages=[{"role": "user", "content": text}]
        )
        return response.content[0].text
```

### 예시 2: 새로운 검색 엔진 추가

```python
# services/search/elastic_engine.py

from elasticsearch import Elasticsearch

class ElasticSearchEngine:
    def __init__(self, hosts: list):
        self.client = Elasticsearch(hosts=hosts)
    
    def search(self, query: str, top_k: int = 5) -> list:
        results = self.client.search(
            index="legal_cases",
            body={"query": {"match": {"content": query}}}
        )
        return results["hits"]["hits"][:top_k]
```

---

## 의존성 관리

새 기능 추가 시 필요한 패키지는 `requirements.txt`에 추가:

```txt
# requirements.txt
# 기존 패키지들...

# 새 기능용 패키지
anthropic==0.8.0    # Claude API
elasticsearch==8.0.0 # Elasticsearch
```

---

## 다음 단계

- [설치 가이드](./SETUP_GUIDE.md): 설치 및 실행 방법
- [API 문서](http://localhost:8000/docs): 실시간 API 테스트
- [README](../README.md): 프로젝트 개요
