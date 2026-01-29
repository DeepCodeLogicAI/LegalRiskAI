# main.py
from jem_api import LegalAnalyzer
import json

# 분석기 초기화
def main():
    print("법률 AI 분석 시스템 시작!")

    analyzer = LegalAnalyzer(
        model_path="../lerning/saved_mode3",  # 학습된 모델 경로
        gemini_api_key="AIzaSyDCPF2qjh6-XJxJK6ws8Vq7eucrMeZo9bUY"
    )
    print(" 모델 로딩 완료!\n")
    
    # 사용자 사연
    story = """
    저는 회사에서 부당해고를 당했습니다. 
    5년간 성실히 근무했으나 경영상의 이유로 갑자기 해고 통보를 받았습니다.
    퇴직금 500만원도 받지 못했고, 해고 예고 수당도 없었습니다.
    회사는 구두로만 통보했고 서면 통지는 받지 못했습니다.
    """

    # 분석 실행
    result = analyzer.analyze(story)

    # 결과 출력
    analyzer.print_result(result)

    # JSON으로 저장
    with open('analysis_result.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

  
    print("\n💾 결과가 analysis_result.json에 저장되었습니다.")

if __name__ == "__main__":
    main()