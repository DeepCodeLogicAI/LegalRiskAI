# services/__init__.py
"""
🚀 Legal AI 서비스 모듈

통합 AI 서비스 구조:

├── classification/     # 분쟁유형 분류 (BERT + Ollama)
│   ├── bert_classifier.py     - KLUE-BERT 분류기 (97.6%)
│   └── ollama_classifier.py   - Qwen2.5:7b LLM 분류
│
├── search/             # 유사 판례 검색 (FAISS)
│   ├── faiss_engine.py        - FAISS 벡터 검색
│   ├── core_ai.py             - 검색 코어 로직
│   └── service.py             - 검색 서비스
│
├── risk/               # 위험도 분석 (BERT + Gemini)
│   └── risk_analyzer.py       - 법률 위험도 분석
│
├── early_warning/      # 조기 위험 감지 (MultiTaskBERT)
│   └── multi_task_model.py    - 4개 수치 예측 모델
│
└── summary/            # LLM 요약 (Gemini)
    ├── gemini_client.py       - Gemini API 클라이언트
    └── summarizer.py          - 요약 생성

담당 분배:
- classification: 분쟁유형 파트
- search: 유사 판례 파트
- risk, early_warning: 조기 위험 파트
- summary: 공용
"""

# 분류 서비스 (분쟁유형)
from .classification import get_classifier, get_ollama_classifier

# 검색 서비스 (유사 판례)
from .search import get_search_engine

# 위험도 분석 (추가 예정)
# from .risk import LegalAnalyzer

# 조기 위험 (추가 예정)
# from .early_warning import MultiTaskLegalBERT
