# app/schemas.py
"""
API 요청/응답 스키마 정의
"""
from pydantic import BaseModel
from typing import List, Optional, Dict


# =====================
# 유사 판례 모델
# =====================
class SimilarCase(BaseModel):
    """유사 판례 정보"""
    case_id: Optional[str] = None
    case_name: str
    court: str
    case_number: str
    case_type: str
    decision_type: str
    decision_result: str
    similarity: float
    xai_reason: str


# =====================
# Ollama LLM 분석 결과
# =====================
class LLMAnalysis(BaseModel):
    """Ollama LLM 상세 분석 결과"""
    available: bool                  # Ollama 사용 가능 여부
    category: Optional[str] = None   # LLM이 분류한 카테고리
    confidence: Optional[float] = None
    reasoning: Optional[str] = None   # 분류 근거 설명
    key_points: Optional[List[str]] = None  # 핵심 쟁점
    related_laws: Optional[List[str]] = None  # 관련 법령


# =====================
# 분류 정보 모델 (BERT + Ollama)
# =====================
class ClassificationInfo(BaseModel):
    """사건 분류 정보 (BERT + Ollama 병행)"""
    inferred_type: str              # BERT 분류 결과
    confidence: float               # BERT 신뢰도
    label: str                      # UI용 레이블
    all_probabilities: Dict[str, float]  # BERT 전체 확률
    llm_analysis: Optional[LLMAnalysis] = None  # Ollama 상세 분석


# =====================
# /analyze 엔드포인트
# =====================
class AnalyzeRequest(BaseModel):
    """분석 요청"""
    case_text: str
    case_type: Optional[str] = None  # None이면 자동 분류


class AnalyzeResponse(BaseModel):
    """분석 응답"""
    overall_risk_level: str         # 높음/중간/낮음
    summary: str                    # LLM 요약
    similar_cases: List[SimilarCase]
    classification: ClassificationInfo


# =====================
# /case/{case_id} 엔드포인트
# =====================
class CaseSummaryResponse(BaseModel):
    """판례 요약 응답"""
    case_id: str
    summary: str


class CaseFullTextResponse(BaseModel):
    """판례 전문 응답"""
    case_id: str
    case_name: str
    court: str
    case_type: str
    decision_type: str
    full_text: str
    summary: Optional[str] = ""


# =====================
# 헬스체크
# =====================
class HealthResponse(BaseModel):
    """헬스체크 응답"""
    status: str
    models_loaded: Dict[str, bool]
    database_connected: bool


# =====================
# DB 저장용 모델
# =====================
class AnalysisResultCreate(BaseModel):
    """분석 결과 DB 저장용"""
    input_text: str
    inferred_case_type: str
    case_type_confidence: float
    overall_risk_level: str
    summary: str
    similar_case_ids: List[str]
