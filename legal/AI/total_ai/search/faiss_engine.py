# search/faiss_engine.py
"""
FAISS 기반 유사 판례 검색 엔진
기존 legal/AI/app/service.py + search_engine.py 통합
"""
import re
import os
import numpy as np
import pandas as pd
from typing import Optional, Dict, List

# Lazy imports
faiss = None
SentenceTransformer = None

def _load_search_deps():
    """Search 의존성 lazy loading"""
    global faiss, SentenceTransformer
    if faiss is None:
        try:
            import faiss as _faiss
            from sentence_transformers import SentenceTransformer as _ST
            faiss = _faiss
            SentenceTransformer = _ST
            return True
        except ImportError as e:
            print(f"[WARN] faiss/sentence_transformers 로드 실패: {e}")
            return False
    return True

try:
    from app.config import settings
except ImportError:
    class settings:
        PARQUET_PATH = r"C:\LawAI\notebooks\korean_precedents_embedded.parquet"
        CSV_PATH = r"C:\LawAI\notebooks\korean_precedents_clean.csv"
        FAISS_INDEX_PATH = r"C:\LawAI\notebooks\case_index.faiss"
        EMBEDDING_MODEL = "snunlp/KR-SBERT-V40K-klueNLI-augSTS"
        TOP_K = 10
        FALLBACK_THRESHOLD = 3


class FAISSSearchEngine:
    """
    FAISS 기반 벡터 검색 엔진
    """
    
    # 리스크 점수 매핑
    RISK_SCORES = {
        "상고기각": 0.85,
        "기각": 0.8,
        "파기환송": 0.5,
        "인용": 0.2,
        "판단불명": 0.5
    }
    
    def __init__(self):
        self._df = None
        self._df_full = None
        self._index = None
        self._model = None
        self._case_id_map = None
        self._loaded = False
        self._deps_available = False
    
    def _load(self):
        """리소스 lazy loading"""
        if self._loaded:
            return
        
        print("\n" + "=" * 60)
        print("[START] 검색 엔진 초기화 중...")
        print("=" * 60)
        
        # 의존성 로드
        self._deps_available = _load_search_deps()
        
        # Parquet 로드 (임베딩 포함)
        print(f"[FILE] Parquet 로드: {settings.PARQUET_PATH}")
        try:
            self._df = pd.read_parquet(settings.PARQUET_PATH, engine="pyarrow")
            print(f"   [OK] {len(self._df)} rows")
        except Exception as e:
            print(f"   [WARN] Parquet 로드 실패: {e}")
            self._df = pd.DataFrame()
        
        # CSV 로드 (전체 텍스트)
        print(f"[FILE] CSV 로드: {settings.CSV_PATH}")
        try:
            self._df_full = pd.read_csv(settings.CSV_PATH)
            print(f"   [OK] {len(self._df_full)} rows")
        except Exception as e:
            print(f"   [WARN] CSV 로드 실패: {e}")
            self._df_full = pd.DataFrame()
        
        # FAISS 인덱스 로드
        if self._deps_available and faiss is not None:
            print(f"[FILE] FAISS 인덱스 로드: {settings.FAISS_INDEX_PATH}")
            try:
                self._index = faiss.read_index(settings.FAISS_INDEX_PATH)
                print(f"   [OK] 인덱스 크기: {self._index.ntotal}")
            except Exception as e:
                print(f"   [WARN] FAISS 인덱스 로드 실패: {e}")
        
        # 임베딩 모델 로드
        if self._deps_available and SentenceTransformer is not None:
            print(f"[FILE] 임베딩 모델 로드: {settings.EMBEDDING_MODEL}")
            try:
                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
                print("   [OK] 모델 로드 완료")
            except Exception as e:
                print(f"   [WARN] 임베딩 모델 로드 실패: {e}")
        
        # 사건번호 → 인덱스 매핑 생성
        self._case_id_map = {}
        if len(self._df_full) > 0:
            for idx, row in self._df_full.iterrows():
                case_num = row.get("사건번호")
                if pd.notna(case_num):
                    normalized = str(case_num).strip()
                    if normalized:
                        self._case_id_map[normalized] = idx
            print(f"   [OK] 사건번호 매핑: {len(self._case_id_map)} entries")
        
        print("=" * 60 + "\n")
        self._loaded = True
    
    def embed(self, text: str) -> Optional[np.ndarray]:
        """텍스트 임베딩"""
        self._load()
        if self._model is None:
            return None
        return self._model.encode([text]).astype("float32")
    
    def search(
        self,
        query_text: str,
        case_type: Optional[str] = None,
        top_k: int = None
    ) -> pd.DataFrame:
        """유사 판례 검색"""
        self._load()
        
        if top_k is None:
            top_k = settings.TOP_K
        
        # 검색 불가능한 경우 빈 DataFrame 반환
        if self._index is None or self._model is None or len(self._df) == 0:
            print("[WARN] 검색 엔진이 준비되지 않았습니다.")
            return pd.DataFrame()
        
        # 쿼리 임베딩
        query_vec = self.embed(query_text)
        if query_vec is None:
            return pd.DataFrame()
        
        # Subset 결정
        subset_df = self._get_search_subset(case_type)
        
        # FAISS 검색
        D, I = self._index.search(query_vec, top_k * 5)
        
        # 후보 추출
        candidates = self._df.iloc[I[0]].copy()
        
        # Subset mask 적용
        filtered = candidates[candidates.index.isin(subset_df.index)]
        
        print(f"[DATA] Subset 검색 결과: {len(filtered)} 건")
        
        # Fallback
        if len(filtered) < settings.FALLBACK_THRESHOLD and case_type and case_type != "전체":
            print(f"[WARN] 결과 부족 → 전체 검색으로 확장")
            D_full, I_full = self._index.search(query_vec, top_k * 3)
            filtered = self._df.iloc[I_full[0]].copy()
            d_min, d_max = D_full[0].min(), D_full[0].max()
            filtered["similarity"] = ((d_max - D_full[0]) / (d_max - d_min + 1e-8)).clip(0, 1)
            return self._add_extra_columns(filtered.head(top_k))
        
        # 정상 반환
        if len(filtered) > 0:
            d_min, d_max = D[0].min(), D[0].max()
            distance_map = dict(zip(I[0], D[0]))
            filtered["_distance"] = filtered.index.map(distance_map)
            filtered["similarity"] = (
                (d_max - filtered["_distance"]) / (d_max - d_min + 1e-8)
            ).clip(0, 1)
            filtered = filtered.drop(columns=["_distance"])
        
        return self._add_extra_columns(filtered.head(top_k))
    
    def _get_search_subset(self, case_type: Optional[str]) -> pd.DataFrame:
        """사건 유형별 검색 subset 반환"""
        if not case_type or case_type == "전체":
            return self._df
        
        if case_type in ["형사", "가사", "민사"]:
            subset = self._df[self._df["사건종류명"] == case_type]
        else:
            subset = self._df[self._df["사건종류명"] == case_type]
        
        return subset if len(subset) > 0 else self._df
    
    def _add_extra_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """유사도 밴드, 판결 결과 등 추가 컬럼"""
        if len(df) == 0:
            return df
        
        df = df.copy()
        df["similarity_band"] = df["similarity"].apply(self._similarity_band)
        df["decision_result"] = df["case_text"].apply(self._extract_decision_result)
        df["risk_score"] = df["decision_result"].map(self.RISK_SCORES).fillna(0.5)
        
        return df
    
    @staticmethod
    def _similarity_band(sim: float) -> str:
        if sim >= 0.85:
            return "매우 높은 유사도"
        elif sim >= 0.65:
            return "상당한 유사도"
        elif sim >= 0.4:
            return "일부 쟁점 유사"
        else:
            return "참고 수준"
    
    @staticmethod
    def _extract_decision_result(case_text: str) -> str:
        if not case_text or pd.isna(case_text):
            return "판단불명"
        
        order_match = re.search(r"【주\s*문】(.+?)(【이\s*유】|$)", case_text, re.DOTALL)
        target = order_match.group(1) if order_match else case_text
        
        patterns = {
            "파기환송": r"(파기|파훼).*(환송|차려)",
            "상고기각": r"상고.*기각",
            "인용": r"청구.*인용|원고.*승소",
            "기각": r"청구.*기각",
        }
        
        for label, pattern in patterns.items():
            if re.search(pattern, target):
                return label
        return "판단불명"
    
    def get_case_by_id(self, case_id: str) -> Optional[pd.Series]:
        """사건번호로 판례 조회"""
        self._load()
        case_id_norm = case_id.strip()
        if case_id_norm in self._case_id_map:
            idx = self._case_id_map[case_id_norm]
            return self._df_full.iloc[idx]
        return None
    
    def get_dataframe(self) -> pd.DataFrame:
        self._load()
        return self._df
    
    def get_full_dataframe(self) -> pd.DataFrame:
        self._load()
        return self._df_full


# 싱글톤 인스턴스
_engine = None


def get_search_engine() -> FAISSSearchEngine:
    global _engine
    if _engine is None:
        _engine = FAISSSearchEngine()
    return _engine
