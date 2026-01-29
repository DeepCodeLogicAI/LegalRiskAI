# llm/summarizer.py
"""
요약 생성 모듈
"""
import pandas as pd
from .gemini_client import call_gemini
from .prompt_templates import build_summary_prompt


def generate_case_summary(
    user_case: str,
    results_df: pd.DataFrame,
    overall_risk_level: str
) -> str:
    """
    유사 판례 분석 결과를 바탕으로 종합 설명 요약 생성
    
    Args:
        user_case: 사용자 사건 텍스트
        results_df: 검색 결과 DataFrame
        overall_risk_level: 종합 리스크 수준
        
    Returns:
        생성된 요약 텍스트
    """
    # DataFrame을 dict 리스트로 변환
    top_cases = results_df.head(5).to_dict(orient="records")
    
    # 프롬프트 생성
    prompt = build_summary_prompt(
        user_case=user_case,
        cases=top_cases,
        overall_risk_level=overall_risk_level
    )
    
    # Gemini API 호출
    return call_gemini(prompt)
