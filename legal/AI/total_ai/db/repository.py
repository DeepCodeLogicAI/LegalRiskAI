# db/repository.py
"""
데이터 저장 레포지토리
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from .models import AnalysisResult, Precedent


class AnalysisRepository:
    """분석 결과 저장 레포지토리"""
    
    @staticmethod
    def save_analysis(
        session: Session,
        input_text: str,
        inferred_case_type: str,
        case_type_confidence: float,
        overall_risk_level: str,
        summary: str,
        similar_case_ids: List[str],
        full_response: Dict[str, Any] = None,
        user_id: int = None
    ) -> AnalysisResult:
        """
        분석 결과 저장
        
        Returns:
            저장된 AnalysisResult 객체
        """
        result = AnalysisResult(
            user_id=user_id,
            input_text=input_text,
            inferred_case_type=inferred_case_type,
            case_type_confidence=case_type_confidence,
            overall_risk_level=overall_risk_level,
            summary=summary,
            similar_case_ids=similar_case_ids,
            full_response=full_response
        )
        
        session.add(result)
        session.flush()  # ID 확보
        
        print(f"[OK] 분석 결과 저장: ID={result.id}")
        return result
    
    @staticmethod
    def get_analysis_by_id(session: Session, analysis_id: int) -> Optional[AnalysisResult]:
        """ID로 분석 결과 조회"""
        return session.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    
    @staticmethod
    def get_recent_analyses(session: Session, limit: int = 10) -> List[AnalysisResult]:
        """최근 분석 결과 조회"""
        return session.query(AnalysisResult)\
            .order_by(AnalysisResult.created_at.desc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_analyses_by_case_type(
        session: Session,
        case_type: str,
        limit: int = 50
    ) -> List[AnalysisResult]:
        """사건 유형별 분석 결과 조회"""
        return session.query(AnalysisResult)\
            .filter(AnalysisResult.inferred_case_type == case_type)\
            .order_by(AnalysisResult.created_at.desc())\
            .limit(limit)\
            .all()


class PrecedentRepository:
    """판례 레포지토리"""
    
    @staticmethod
    def get_by_case_number(session: Session, case_number: str) -> Optional[Precedent]:
        """사건번호로 판례 조회"""
        return session.query(Precedent)\
            .filter(Precedent.case_number == case_number)\
            .first()
    
    @staticmethod
    def save_precedent(
        session: Session,
        case_number: str,
        case_name: str,
        court_name: str,
        case_type: str,
        decision_type: str,
        case_text: str
    ) -> Precedent:
        """판례 저장"""
        precedent = Precedent(
            case_number=case_number,
            case_name=case_name,
            court_name=court_name,
            case_type=case_type,
            decision_type=decision_type,
            case_text=case_text
        )
        
        session.add(precedent)
        session.flush()
        
        return precedent
    
    @staticmethod
    def count_by_case_type(session: Session) -> Dict[str, int]:
        """사건 유형별 판례 수"""
        from sqlalchemy import func
        
        results = session.query(
            Precedent.case_type,
            func.count(Precedent.id)
        ).group_by(Precedent.case_type).all()
        
        return {case_type: count for case_type, count in results}
