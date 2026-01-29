# app/main.py
"""
Legal AI 통합 FastAPI 서버
- BERT 분류기 (boonAI/final)
- FAISS 검색 (기존 legal/AI)
- Gemini LLM 요약
- PostgreSQL DB 저장
"""
import os
import sys
import time
from contextlib import asynccontextmanager
from typing import Optional

# 현재 디렉토리를 Python 경로에 추가
UNIFIED_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if UNIFIED_DIR not in sys.path:
    sys.path.insert(0, UNIFIED_DIR)

import pandas as pd
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import (
    AnalyzeRequest, AnalyzeResponse, ClassificationInfo,
    CaseSummaryResponse, CaseFullTextResponse,
    HealthResponse, SimilarCase
)
from classifier.bert_classifier import get_classifier
from search.faiss_engine import get_search_engine
from llm.summarizer import generate_case_summary

# DB는 선택적으로 import
if settings.USE_DATABASE:
    from sqlalchemy.orm import Session
    from db.connection import get_db_manager, get_db
    from db.repository import AnalysisRepository
else:
    Session = None
    get_db_manager = None
    get_db = None
    AnalysisRepository = None


# =====================
# 앱 생명주기
# =====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    print("\n" + "=" * 60)
    print("[START] Legal AI Unified Server")
    print("=" * 60)
    
    # 모델 사전 로드
    print("\n[INFO] Loading models...")
    get_classifier()
    get_search_engine()
    
    # DB 연결 테스트 (설정된 경우)
    if settings.USE_DATABASE:
        print("\n[INFO] Testing DB connection...")
        db_manager = get_db_manager()
        if db_manager.test_connection():
            db_manager.create_tables()
    
    print("\n[OK] Server ready!")
    print("=" * 60 + "\n")
    
    yield
    
    print("\n[SHUTDOWN] Server stopped")


# =====================
# FastAPI 앱 생성
# =====================
app = FastAPI(
    title="Legal AI 통합 분석 API",
    description="판례 검색 + BERT 사건 분류 + LLM 요약 통합 서비스",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정 - React 앱 허용
origins = [
    "http://localhost:5173",  # React dev server
    "http://localhost:8484",  # Spring Boot
    "http://localhost:3000",  # 기타
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 또는 ["*"] 개발용 (모든 origin 허용)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =====================
# 헬스체크
# =====================
@app.get("/", tags=["Health"])
def root():
    """루트 엔드포인트"""
    return {"message": "Legal AI 통합 API", "version": "1.0.0"}


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """헬스체크"""
    # DB 연결 상태
    db_connected = False
    if settings.USE_DATABASE:
        db_manager = get_db_manager()
        db_connected = db_manager.test_connection()
    
    return HealthResponse(
        status="healthy",
        models_loaded={
            "bert_classifier": get_classifier() is not None,
            "faiss_engine": get_search_engine() is not None
        },
        database_connected=db_connected
    )


# =====================
# 1. 통합 분석 API
# =====================
@app.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
def analyze_case(request: AnalyzeRequest):
    """
    사건 텍스트 종합 분석
    
    1. BERT 분류기로 사건 유형 분류 (빠른 카테고리 분류)
    2. Ollama Qwen으로 상세 법적 분석 (느리지만 상세함)
    3. FAISS로 유사 판례 검색
    4. Gemini로 분석 요약 생성
    5. (선택) DB에 결과 저장
    """
    start = time.time()
    
    print("\n" + "=" * 60)
    print("[START] /analyze 요청 시작")
    print("=" * 60)
    print(f"[TEXT] 입력 텍스트 길이: {len(request.case_text)} chars")
    
    # 입력 검증
    if not request.case_text or not request.case_text.strip():
        raise HTTPException(status_code=400, detail="case_text is required")
    
    # ========================================
    # 1️⃣ 사건 유형 분류 (BERT)
    # ========================================
    classifier = get_classifier()
    
    if request.case_type:
        # 사용자가 직접 지정한 경우
        inferred_type = request.case_type
        confidence = 1.0
        all_probs = {request.case_type: 1.0}
        print(f"[PIN] 사용자 지정 유형: {inferred_type}")
    else:
        # BERT 자동 분류
        inferred_type, confidence, all_probs = classifier.classify(request.case_text)
        print(f"[BERT] 분류: {inferred_type} (신뢰도: {confidence:.2f})")
    
    # ========================================
    # 2️⃣ Ollama LLM 상세 분석 (Qwen2.5:7b)
    # ========================================
    from classifier.ollama_classifier import get_ollama_classifier
    from app.schemas import LLMAnalysis
    
    ollama_classifier = get_ollama_classifier()
    llm_result = None
    
    if ollama_classifier.is_available():
        print("[INFO] Running Ollama (Qwen2.5:7b) analysis...")
        llm_result = ollama_classifier.classify(request.case_text)
    
    # LLMAnalysis 객체 생성
    if llm_result:
        llm_analysis = LLMAnalysis(
            available=True,
            category=llm_result.get("category"),
            confidence=llm_result.get("confidence"),
            reasoning=llm_result.get("reasoning"),
            key_points=llm_result.get("key_points"),
            related_laws=llm_result.get("related_laws")
        )
        print(f"[QWEN] 분류: {llm_result.get('category')} (신뢰도: {llm_result.get('confidence', 0):.2f})")
    else:
        llm_analysis = LLMAnalysis(available=False)
        print("[WARN] Ollama not available, skipping LLM analysis")
    
    # 분류 정보 통합
    classification = ClassificationInfo(
        inferred_type=inferred_type,
        confidence=confidence,
        label=classifier.get_class_label(inferred_type),
        all_probabilities=all_probs,
        llm_analysis=llm_analysis  # Ollama 결과 포함
    )
    
    # ========================================
    # 2️⃣ 유사 판례 검색 (FAISS)
    # ========================================
    engine = get_search_engine()
    results_df = engine.search(
        query_text=request.case_text,
        case_type=inferred_type,
        top_k=settings.TOP_K
    )
    
    print(f"[DATA] 검색 결과: {len(results_df)} 건")
    
    # ========================================
    # 3️⃣ 리스크 평가
    # ========================================
    if len(results_df) > 0:
        avg_risk = results_df["risk_score"].mean()
    else:
        avg_risk = 0.5
    
    if avg_risk >= 0.7:
        overall_risk = "높음"
    elif avg_risk >= 0.4:
        overall_risk = "중간"
    else:
        overall_risk = "낮음"
    
    print(f"[WARN] 리스크 수준: {overall_risk} (평균: {avg_risk:.2f})")
    
    # ========================================
    # 4️⃣ LLM 요약 생성
    # ========================================
    try:
        summary = generate_case_summary(
            user_case=request.case_text,
            results_df=results_df.head(5),
            overall_risk_level=overall_risk
        )
    except Exception as e:
        print(f"[WARN] 요약 생성 오류: {e}")
        summary = "요약 생성 중 오류가 발생했습니다. 유사 판례 목록을 참고해 주세요."
    
    # ========================================
    # 5️⃣ 응답 생성
    # ========================================
    similar_cases = []
    similar_case_ids = []
    
    for _, row in results_df.iterrows():
        case_id = str(row.get("사건번호", "")) if pd.notna(row.get("사건번호")) else None
        if case_id:
            similar_case_ids.append(case_id)
        
        similar_cases.append(SimilarCase(
            case_id=case_id,
            case_name=str(row.get("사건명", "")),
            court=str(row.get("법원명", "")),
            case_number=str(row.get("사건번호", "")) if pd.notna(row.get("사건번호")) else "",
            case_type=str(row.get("사건종류명", "")),
            decision_type=str(row.get("판결유형", "판결")),
            decision_result=str(row.get("decision_result", "판단불명")),
            similarity=float(row.get("similarity", 0)),
            xai_reason=f"{row.get('similarity_band', '')}에 해당하며, 판단 결과는 '{row.get('decision_result', '판단불명')}'입니다."
        ))
    
    # ========================================
    # 6️⃣ DB 저장 (설정된 경우)
    # ========================================
    if settings.USE_DATABASE and AnalysisRepository is not None:
        try:
            db_manager = get_db_manager()
            with db_manager.get_session() as db:
                full_response = {
                    "overall_risk_level": overall_risk,
                    "summary": summary,
                    "similar_cases": [c.model_dump() for c in similar_cases],
                    "classification": classification.model_dump()
                }
                
                AnalysisRepository.save_analysis(
                    session=db,
                    input_text=request.case_text,
                    inferred_case_type=inferred_type,
                    case_type_confidence=confidence,
                    overall_risk_level=overall_risk,
                    summary=summary,
                    similar_case_ids=similar_case_ids,
                    full_response=full_response
                )
        except Exception as e:
            print(f"[WARN] DB 저장 오류 (무시): {e}")
    
    elapsed = time.time() - start
    print(f"\n[OK] /analyze 완료: {elapsed:.2f}s")
    print("=" * 60 + "\n")
    
    return AnalyzeResponse(
        overall_risk_level=overall_risk,
        summary=summary,
        similar_cases=similar_cases,
        classification=classification
    )


# =====================
# 2. 판례 요약 조회 API
# =====================
@app.get("/case/{case_id}/summary", response_model=CaseSummaryResponse, tags=["Case"])
def get_case_summary(case_id: str):
    """
    사건번호로 판례 요약 조회
    """
    engine = get_search_engine()
    case_data = engine.get_case_by_id(case_id)
    
    if case_data is None:
        raise HTTPException(status_code=404, detail=f"Case not found: {case_id}")
    
    # 요약 생성
    try:
        df = pd.DataFrame([case_data])
        summary = generate_case_summary(
            user_case="",
            results_df=df,
            overall_risk_level=""
        )
    except Exception as e:
        print(f"[WARN] 요약 생성 오류: {e}")
        summary = "요약 생성 불가"
    
    return CaseSummaryResponse(case_id=case_id, summary=summary)


# =====================
# 3. 판례 전문 조회 API
# =====================
@app.get("/case/{case_id}/full", response_model=CaseFullTextResponse, tags=["Case"])
def get_case_full_text(case_id: str):
    """
    사건번호로 판례 전문 조회
    """
    print(f"[FILE] /case/{case_id}/full 요청")
    
    engine = get_search_engine()
    case_data = engine.get_case_by_id(case_id)
    
    if case_data is None:
        raise HTTPException(status_code=404, detail=f"Case not found: {case_id}")
    
    full_text = case_data.get("case_text", "")
    if not full_text or pd.isna(full_text):
        full_text = "판례 전문을 찾을 수 없습니다."
    
    # 요약 생성
    try:
        df = pd.DataFrame([case_data])
        summary = generate_case_summary(
            user_case="",
            results_df=df,
            overall_risk_level=""
        )
    except Exception as e:
        print(f"[WARN] 요약 생성 오류: {e}")
        summary = ""
    
    return CaseFullTextResponse(
        case_id=case_id,
        case_name=str(case_data.get("사건명", "")),
        court=str(case_data.get("법원명", "")),
        case_type=str(case_data.get("사건종류명", "")),
        decision_type=str(case_data.get("판결유형", "")),
        full_text=full_text,
        summary=summary
    )


# =====================
# 4. 분류만 수행 API
# =====================
@app.post("/classify", response_model=ClassificationInfo, tags=["Classification"])
def classify_case(request: AnalyzeRequest):
    """
    사건 유형 분류만 수행 (BERT)
    """
    if not request.case_text or not request.case_text.strip():
        raise HTTPException(status_code=400, detail="case_text is required")
    
    classifier = get_classifier()
    inferred_type, confidence, all_probs = classifier.classify(request.case_text)
    
    return ClassificationInfo(
        inferred_type=inferred_type,
        confidence=confidence,
        label=classifier.get_class_label(inferred_type),
        all_probabilities=all_probs
    )


# =====================
# 5. 위험도 분석 API (AI_jogi)
# =====================
@app.post("/risk-analyze", tags=["Risk Analysis"])
def risk_analyze(request: AnalyzeRequest):
    """
    법률 위험도 분석 (MultiTaskLegalBERT + Gemini)
    
    반환값:
    - win_rate: 예상 승소율 (%)
    - sentence: 예상 형량 (년)
    - fine: 예상 벌금 (원)
    - risk: 위험도 점수 (0-100)
    - feedback: Gemini 상세 피드백 (선택)
    """
    if not request.case_text or not request.case_text.strip():
        raise HTTPException(status_code=400, detail="case_text is required")
    
    try:
        from services.risk.risk_analyzer import LegalAnalyzer, MODEL_PATH
        from app.config import settings
        
        # LegalAnalyzer 초기화
        analyzer = LegalAnalyzer(
            model_path=MODEL_PATH,
            gemini_api_key=settings.GEMINI_API_KEY
        )
        
        # 분석 실행
        result = analyzer.analyze(request.case_text)
        
        return {
            "success": True,
            "win_rate": result.get("win_rate"),
            "sentence": result.get("sentence"),
            "fine": result.get("fine"),
            "risk": result.get("risk"),
            "feedback": result.get("feedback"),
            "original_text": request.case_text[:200] + "..."
        }
        
    except ImportError as e:
        return {
            "success": False,
            "error": "Risk analyzer not available",
            "detail": str(e)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")


# =====================
# 6. 조기 위험 감지 API (AI_jogi)
# =====================
@app.post("/early-warning", tags=["Early Warning"])
def early_warning(request: AnalyzeRequest):
    """
    조기 위험 감지 (승소율/형량/벌금/위험도 예측만)
    
    Gemini 피드백 없이 빠른 예측만 수행
    """
    if not request.case_text or not request.case_text.strip():
        raise HTTPException(status_code=400, detail="case_text is required")
    
    try:
        import torch
        from transformers import AutoTokenizer
        from services.early_warning.multi_task_model import MultiTaskLegalBERT
        
        model_path = "models/multi_task_bert"
        
        # 모델 로드 (간단 버전)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        tokenizer = AutoTokenizer.from_pretrained("klue/bert-base")
        model = MultiTaskLegalBERT.from_pretrained(model_path, num_labels=3).to(device)
        model.eval()
        
        # 예측
        inputs = tokenizer(
            request.case_text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512
        )
        inputs = {k: v.to(device) for k, v in inputs.items() if k != 'token_type_ids'}
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        return {
            "success": True,
            "predictions": {
                "win_rate": max(0, min(100, outputs['win_rate'].item())),
                "sentence_years": max(0, outputs['sentence'].item()),
                "fine_amount": max(0, outputs['fine'].item()),
                "risk_score": max(0, min(100, outputs['risk'].item()))
            },
            "device": str(device)
        }
        
    except ImportError as e:
        return {
            "success": False,
            "error": "Early warning model not available",
            "detail": str(e)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Early warning failed: {str(e)}")


# =====================
# 메인 실행
# =====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
