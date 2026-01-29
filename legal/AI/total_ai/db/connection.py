# db/connection.py
"""
데이터베이스 연결 관리
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
from typing import Generator
from app.config import settings
from .models import Base


class DatabaseManager:
    """데이터베이스 연결 관리자"""
    
    def __init__(self, database_url: str = None):
        self.database_url = database_url or settings.DATABASE_URL
        self._engine = None
        self._SessionLocal = None
    
    def _get_engine(self):
        """엔진 lazy loading"""
        if self._engine is None:
            self._engine = create_engine(
                self.database_url,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True  # 연결 상태 확인
            )
        return self._engine
    
    def _get_session_factory(self):
        """세션 팩토리 lazy loading"""
        if self._SessionLocal is None:
            self._SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self._get_engine()
            )
        return self._SessionLocal
    
    def create_tables(self):
        """테이블 생성"""
        engine = self._get_engine()
        Base.metadata.create_all(bind=engine)
        print("[OK] DB 테이블 생성 완료")
    
    def drop_tables(self):
        """테이블 삭제 (주의!)"""
        engine = self._get_engine()
        Base.metadata.drop_all(bind=engine)
        print("[WARN] DB 테이블 삭제 완료")
    
    @contextmanager
    def get_session(self) -> Generator[Session, None, None]:
        """세션 컨텍스트 매니저"""
        SessionLocal = self._get_session_factory()
        session = SessionLocal()
        try:
            yield session
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            print(f"[ERROR] DB 오류: {e}")
            raise
        finally:
            session.close()
    
    def test_connection(self) -> bool:
        """연결 테스트"""
        try:
            engine = self._get_engine()
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[OK] DB 연결 성공")
            return True
        except Exception as e:
            print(f"[ERROR] DB 연결 실패: {e}")
            return False
    
    def init_pgvector(self):
        """pgvector 확장 초기화"""
        try:
            engine = self._get_engine()
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.commit()
            print("[OK] pgvector 확장 초기화 완료")
        except Exception as e:
            print(f"[WARN] pgvector 초기화 오류 (무시 가능): {e}")


# 싱글톤 인스턴스
_db_manager = None


def get_db_manager() -> DatabaseManager:
    """DB 매니저 싱글톤 반환"""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager


def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency용 세션 반환"""
    db_manager = get_db_manager()
    with db_manager.get_session() as session:
        yield session
