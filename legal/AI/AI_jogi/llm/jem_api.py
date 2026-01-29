# legal_analyzer.py
import google.generativeai as genai
import torch
import pickle
from transformers import AutoTokenizer
import json
from typing import Dict, Any
from model import MultiTaskLegalBERT #내가 만든 모델 불러와

class LegalAnalyzer:
    """법률 사건 분석 클래스 (BERT + Gemini)"""
    
    def __init__(self, model_path: str, gemini_api_key: str):
        """
        Args:
            model_path: 학습된 BERT 모델 경로
            gemini_api_key: Gemini API 키
        """
        # BERT 모델 로드
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained("klue/bert-base")
        
        #모델로드/딥러닝했던 모델 불러와 
        self.model = MultiTaskLegalBERT.from_pretrained(
            model_path, num_labels=3).to(self.device)
        self.model.eval()
        
        # llm 불러와 / Gemini 설정
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel('gemini-pro')
        
        # # 클래스 이름 로드
        # with open(f"{model_path}/config.json", 'r') as f:
        #     config = json.load(f)
        #     self.class_names = config.get('class_names', ['민사/가사소송', '행정소송', '형사소송'])
    
    def predict_bert(self, text: str) -> Dict[str, Any]:
        """BERT로 기본 수치 예측"""
        inputs = self.tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            padding=True, 
            max_length=512
        )
        
         # token_type_ids 제거
        inputs = {k: v.to(self.device) for k, v in inputs.items()
                  if k != 'token_type_ids'}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # # 소송 유형 예측
        # logits = outputs['logits']
        # case_type_idx = logits.argmax(-1).item()
        
        return {
           # 'case_type': self.class_names[case_type_idx],
            'win_rate': max(0, min(100, outputs['win_rate'].item())),
            'sentence': max(0, outputs['sentence'].item()),
            'fine': max(0, outputs['fine'].item()),
            'risk': max(0, min(100, outputs['risk'].item()))
        }
    
    def generate_feedback(self, story: str, bert_results: Dict) -> str:
        """Gemini로 상세 피드백 생성"""
        prompt = f"""
당신은 법률 전문가이자 승소율 높은 최고의 변호사입니다. 다음 사연을 분석하고 조언해주세요.

【사연】
{story}

【AI 예측 결과】
- 소송 유형: {bert_results['case_type']}
- 승소율: {bert_results['win_rate']:.1f}%
- 예상 형량: {bert_results['sentence']:.1f}년
- 예상 벌금: {bert_results['fine']:,.0f}원
- 위험도: {bert_results['risk']:.1f}/100

다음 형식으로 답변해주세요:

1. 승소율 분석
   - 예측 근거
   - 유리한 점
   - 불리한 점

2. 대응 전략
   - 즉시 해야 할 조치
   - 증거 확보 방안
   - 법률 검토 포인트

3. 주의사항
   - 법적 위험 요소
   - 피해야 할 행동

4. 전문가 상담 추천
   - 필요성 (상/중/하)
   - 추천 전문 분야
"""
        
        response = self.gemini_model.generate_content(prompt)
        return response.text
    
    def analyze(self, story: str) -> Dict[str, Any]:
        """통합 분석 실행"""
        print("🔍 BERT 모델 분석 중...")
        bert_results = self.predict_bert(story)
        
        print("💬 Gemini 피드백 생성 중...")
        feedback = self.generate_feedback(story, bert_results)
        
        return {
            **bert_results,
            'feedback': feedback,
            'original_story': story
        }
    
    def print_result(self, result: Dict[str, Any]):
        """결과를 보기 좋게 출력"""
        print("\n" + "="*70)
        print("⚖️  법률 사건 분석 결과")
        print("="*70)
        
        print(f"\n📋 소송 유형: {result['case_type']}")
        print(f"📊 예상 승소율: {result['win_rate']:.1f}%")
        
        if result['sentence'] > 0.1:
            print(f"⚖️  예상 형량: {result['sentence']:.1f}년")
        
        if result['fine'] > 10000:
            print(f"💰 예상 벌금: {result['fine']:,.0f}원")
        
        print(f"⚠️  위험도: {result['risk']:.1f}/100")
        
        print("\n" + "-"*70)
        print("💡 전문가 피드백:")
        print("-"*70)
        print(result['feedback'])
        print("="*70)