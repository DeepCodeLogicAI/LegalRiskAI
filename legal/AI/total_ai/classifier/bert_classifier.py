# classifier/bert_classifier.py
"""
KLUE-BERT 기반 사건 유형 분류기
boonAI/final/ 모델 통합
"""
import os
import re
from typing import Tuple, Dict

# Lazy imports for torch to avoid import errors
torch = None
AutoTokenizer = None
AutoModelForSequenceClassification = None

def _load_torch():
    """Lazy load torch and transformers"""
    global torch, AutoTokenizer, AutoModelForSequenceClassification
    if torch is None:
        try:
            import torch as _torch
            from transformers import AutoTokenizer as _AT, AutoModelForSequenceClassification as _AM
            torch = _torch
            AutoTokenizer = _AT
            AutoModelForSequenceClassification = _AM
            return True
        except ImportError as e:
            print(f"[WARN] torch/transformers load failed: {e}")
            return False
    return True

try:
    from app.config import settings
except ImportError:
    # Fallback if config not available
    class settings:
        BERT_MODEL_PATH = "models/bert_classifier"


class BertClassifier:
    """
    KLUE-BERT 기반 사건 분류기
    - 6개 클래스: 가사, 민사, 세무, 일반행정, 특허, 형사
    - 정확도: 97.6%
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.BERT_MODEL_PATH
        self._model = None
        self._tokenizer = None
        self._label_encoder = None
        self._torch_available = _load_torch()
        
        # Device 설정 (torch 사용 가능할 때만)
        if self._torch_available and torch is not None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = None
        
        # 클래스 목록 (model_info.json 기준)
        self.classes = ["가사", "민사", "세무", "일반행정", "특허", "형사"]
        
    def _load_model(self):
        """모델 lazy loading"""
        if self._model is None:
            # torch가 사용 가능한지 확인
            if not self._torch_available or torch is None:
                print("[WARN] torch unavailable. Using rule-based classifier.")
                return False
            
            print(f"[INFO] Loading BERT classifier... ({self.model_path})")
            
            # 모델 경로 확인
            if not os.path.exists(self.model_path):
                print(f"[WARN] Model path not found: {self.model_path}")
                print("[INFO] Using rule-based classifier.")
                return False
            
            try:
                import pickle
                self._tokenizer = AutoTokenizer.from_pretrained(self.model_path)
                self._model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
                self._model.to(self.device)
                self._model.eval()
                
                # 레이블 인코더 로드 (있으면)
                label_encoder_path = os.path.join(self.model_path, "label_encoder.pkl")
                if os.path.exists(label_encoder_path):
                    with open(label_encoder_path, "rb") as f:
                        self._label_encoder = pickle.load(f)
                
                print(f"[OK] BERT classifier loaded (device: {self.device})")
                return True
            except Exception as e:
                print(f"[ERROR] BERT load error: {e}")
                return False
        return True
    
    def classify(self, text: str) -> Tuple[str, float, Dict[str, float]]:
        """
        텍스트 분류
        
        Args:
            text: 분류할 텍스트
            
        Returns:
            (predicted_class, confidence, all_probabilities)
        """
        # BERT 모델 사용 가능한지 확인
        if not self._load_model():
            # Rule-based fallback
            return self._rule_based_classify(text)
        
        # 토큰화
        inputs = self._tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding="max_length"
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # 추론
        with torch.no_grad():
            outputs = self._model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1)
        
        # 결과 처리
        probs_np = probs.cpu().numpy()[0]
        predicted_idx = probs_np.argmax()
        predicted_class = self.classes[predicted_idx]
        confidence = float(probs_np[predicted_idx])
        
        all_probs = {cls: float(probs_np[i]) for i, cls in enumerate(self.classes)}
        
        return predicted_class, confidence, all_probs
    
    def _rule_based_classify(self, text: str) -> Tuple[str, float, Dict[str, float]]:
        """
        Rule-based 분류 (BERT 로드 실패 시 fallback)
        """
        import re
        
        text_lower = text.lower()
        
        patterns = {
            "형사": [r"폭행|상해|절도|사기|횡령|배임", r"고소|고발|기소|구속", r"징역|벌금|실형"],
            "가사": [r"이혼|별거|혼인", r"양육권|친권|면접교섭", r"위자료|재산분할"],
            "민사": [r"손해배상|계약|채무", r"대여금|매매|임대차"],
            "세무": [r"세금|과세|국세|지방세", r"부가가치세|소득세|법인세"],
            "일반행정": [r"행정처분|인허가|영업정지", r"취소소송|무효확인"],
            "특허": [r"특허|실용신안|상표|디자인", r"지식재산|저작권"]
        }
        
        scores = {}
        for case_type, pattern_list in patterns.items():
            score = sum(1 for p in pattern_list if re.search(p, text_lower))
            scores[case_type] = score
        
        max_type = max(scores, key=scores.get)
        max_score = scores[max_type]
        
        if max_score == 0:
            return "민사", 0.3, {k: 0.0 for k in self.classes}
        
        confidence = min(0.9, 0.5 + max_score * 0.15)
        all_probs = {k: v / (sum(scores.values()) + 1e-8) for k, v in scores.items()}
        
        return max_type, confidence, all_probs
    
    def get_class_label(self, case_type: str) -> str:
        """UI 표시용 레이블"""
        labels = {
            "가사": "가사 사건 (이혼/양육권/재산분할)",
            "민사": "민사 사건 (계약/손해배상)",
            "세무": "세무 사건 (조세/과세)",
            "일반행정": "행정 사건 (행정처분/인허가)",
            "특허": "특허 사건 (지식재산권)",
            "형사": "형사 사건 (범죄/형벌)"
        }
        return labels.get(case_type, "일반 사건")


# 싱글톤 인스턴스
_classifier = None


def get_classifier() -> BertClassifier:
    """분류기 싱글톤 반환"""
    global _classifier
    if _classifier is None:
        _classifier = BertClassifier()
    return _classifier
