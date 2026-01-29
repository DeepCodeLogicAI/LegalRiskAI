# services/search/__init__.py
"""
유사 판례 검색 서비스
- FAISS 기반 벡터 검색
- XAI 설명 생성
- 종합 리스크 판단
"""
from .faiss_engine import FAISSSearchEngine, get_search_engine
# TODO: from .core_ai import search_similar_cases, run_case_analysis
