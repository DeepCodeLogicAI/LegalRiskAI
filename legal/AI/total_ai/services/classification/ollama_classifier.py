# classifier/ollama_classifier.py
"""
Ollama 기반 LLM 분류기 (Qwen2.5:7b)
BERT 분류기와 병행하여 상세한 법적 분석 제공
"""
import json
from typing import Dict, Optional

# Lazy import
ChatOllama = None

def _load_ollama():
    """Ollama 의존성 lazy loading"""
    global ChatOllama
    if ChatOllama is None:
        try:
            from langchain_ollama import ChatOllama as _CO
            ChatOllama = _CO
            return True
        except ImportError as e:
            print(f"[WARN] Ollama not available: {e}")
            return False
    return True


class OllamaClassifier:
    """
    Ollama 기반 사건 분류기
    - BERT보다 느리지만 더 상세한 분석 제공
    - 법적 근거와 설명 포함
    """
    
    # 분류 프롬프트 템플릿
    CLASSIFICATION_PROMPT = """당신은 전문 법률 AI입니다. 다음 사건을 분석하여 분류하세요.

사건 내용:
{text}

다음 카테고리 중 하나로 분류하세요:
1. 가사 - 이혼, 양육권, 재산분할 등
2. 민사 - 계약, 손해배상, 임대차 등
3. 세무 - 조세, 과세, 국세 등
4. 일반행정 - 행정처분, 인허가 등
5. 특허 - 지식재산권, 저작권 등
6. 형사 - 범죄, 형벌, 고소 등

응답은 반드시 다음 JSON 형식으로만 작성하세요:
{{
  "category": "카테고리명",
  "confidence": 0.0-1.0 사이의 신뢰도,
  "reasoning": "분류 근거 설명",
  "key_points": ["핵심 쟁점1", "핵심 쟁점2"],
  "related_laws": ["관련 법령1", "관련 법령2"]
}}

JSON만 응답하세요."""

    def __init__(self, model_name="qwen2.5:7b", base_url="http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self._llm = None
        self._available = _load_ollama()
        
        # Ollama 사용 가능하면 초기화
        if self._available and ChatOllama is not None:
            try:
                self._llm = ChatOllama(
                    model=self.model_name,
                    base_url=self.base_url,
                    temperature=0.1,  # 일관된 분류를 위해 낮게 설정
                    num_predict=512
                )
                print(f"[OK] Ollama classifier ready: {self.model_name}")
            except Exception as e:
                print(f"[WARN] Ollama initialization failed: {e}")
                self._available = False
    
    def is_available(self) -> bool:
        """Ollama 사용 가능 여부"""
        return self._available and self._llm is not None
    
    def classify(self, text: str) -> Optional[Dict]:
        """
        텍스트 분류
        
        Returns:
            {
                "category": str,
                "confidence": float,
                "reasoning": str,
                "key_points": List[str],
                "related_laws": List[str]
            }
            또는 None (Ollama 사용 불가 시)
        """
        if not self.is_available():
            print("[WARN] Ollama not available, skipping LLM classification")
            return None
        
        try:
            # 프롬프트 생성
            prompt = self.CLASSIFICATION_PROMPT.format(text=text[:1000])  # 최대 1000자
            
            # LLM 호출
            print(f"[INFO] Calling Ollama ({self.model_name})...")
            response = self._llm.invoke(prompt)
            
            # JSON 파싱
            content = response.content.strip()
            
            # JSON 추출 (코드 블록 제거)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            result = json.loads(content)
            
            # 검증
            if "category" not in result:
                print("[ERROR] Invalid response format from Ollama")
                return None
            
            print(f"[OK] Ollama classification: {result.get('category')}")
            return result
            
        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to parse Ollama response: {e}")
            print(f"Response content: {content[:200]}")
            return None
        except Exception as e:
            print(f"[ERROR] Ollama classification failed: {e}")
            return None


# 싱글톤 인스턴스
_ollama_classifier = None


def get_ollama_classifier() -> OllamaClassifier:
    """Ollama 분류기 싱글톤"""
    global _ollama_classifier
    if _ollama_classifier is None:
        _ollama_classifier = OllamaClassifier()
    return _ollama_classifier
