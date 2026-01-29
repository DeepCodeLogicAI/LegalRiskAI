# app/config.py
"""
환경 설정 모듈 - 모든 경로와 설정을 중앙 관리
"""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# .env 파일 로드 (total_ai 디렉토리에서)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    """애플리케이션 설정"""
    
    def __init__(self):
        # 기본 경로
        self.BASE_DIR = Path(__file__).parent.parent
        
        # 모델 경로 (boonAI/final 에서 복사됨)
        self.BERT_MODEL_PATH = str(self.BASE_DIR / "models" / "bert_classifier")
        
        # FAISS 인덱스 경로
        self.FAISS_INDEX_PATH = os.getenv(
            "FAISS_INDEX_PATH",
            r"C:\LawAI\notebooks\case_index.faiss"
        )
        
        # 데이터 파일 경로
        self.PARQUET_PATH = os.getenv(
            "PARQUET_PATH",
            r"C:\LawAI\notebooks\korean_precedents_embedded.parquet"
        )
        self.CSV_PATH = os.getenv(
            "CSV_PATH",
            r"C:\LawAI\notebooks\korean_precedents_clean.csv"
        )
        
        # Gemini API
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
        
        # 데이터베이스
        self.DATABASE_URL = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:legalai123@localhost:5432/legal_ai"
        )
        self.USE_DATABASE = os.getenv("USE_DATABASE", "false").lower() == "true"
        
        # CORS 허용 origins
        origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:8484,http://localhost:3000")
        self.ALLOWED_ORIGINS: List[str] = origins_str.split(",")
        
        # 임베딩 모델
        self.EMBEDDING_MODEL = "snunlp/KR-SBERT-V40K-klueNLI-augSTS"
        
        # 검색 설정
        self.TOP_K = 10
        self.FALLBACK_THRESHOLD = 3

# 싱글톤 인스턴스
settings = Settings()
