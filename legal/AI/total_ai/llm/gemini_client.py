# llm/gemini_client.py
"""
Gemini API 클라이언트
"""
import os
import google.generativeai as genai
from app.config import settings

# API 키 설정
genai.configure(api_key=settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.0-flash"


def call_gemini(prompt: str) -> str:
    """
    Gemini API 호출
    
    Args:
        prompt: 프롬프트 텍스트
        
    Returns:
        생성된 텍스트
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"[WARN] Gemini API 오류: {e}")
        return f"요약 생성 중 오류가 발생했습니다: {str(e)}"
