# db/models.py
"""
SQLAlchemy 모델 정의
PostgreSQL + pgvector
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()


class Precedent(Base):
    """판례 테이블"""
    __tablename__ = "precedents"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(String(100), unique=True, nullable=False, index=True)  # 사건번호
    case_name = Column(String(500))                                              # 사건명
    court_name = Column(String(100))                                             # 법원명
    case_type = Column(String(50), index=True)                                   # 사건종류명
    decision_type = Column(String(50))                                           # 판결유형
    case_text = Column(Text)                                                     # 판례 전문
    # embedding은 pgvector로 별도 처리 (VECTOR(768))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Precedent(id={self.id}, case_number='{self.case_number}')>"


class AnalysisResult(Base):
    """분석 결과 저장 테이블"""
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=True)                                    # 사용자 ID (선택)
    input_text = Column(Text, nullable=False)                                   # 입력 텍스트
    inferred_case_type = Column(String(50))                                     # 추론된 사건 유형
    case_type_confidence = Column(Float)                                        # 분류 신뢰도
    overall_risk_level = Column(String(20))                                     # 리스크 수준
    summary = Column(Text)                                                       # LLM 요약
    similar_case_ids = Column(ARRAY(String))                                    # 유사 판례 ID 배열
    full_response = Column(JSONB)                                               # 전체 응답 JSON
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<AnalysisResult(id={self.id}, case_type='{self.inferred_case_type}')>"
