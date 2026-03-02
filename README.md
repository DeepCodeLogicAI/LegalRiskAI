# ⚖️ LegalRiskAI: 인공지능(AI) 법률 비서

> **사건 분석 및 솔루션 제시**
> 데이터 기반 분석을 통해 누구나 쉽게 활용 가능한 법률 정보 제공 및 의사결정을 돕는 AI 법률 어시스턴트 서비스입니다.
<br>

---


## 📝 프로젝트 소개

### **"법률 서비스의 문턱을 낮추는 AI 어시스턴트"**

**LegalRiskAI**는 익숙하지 않은 법률정보를 누구나 쉽게 확인하고 참고할 수 있도록 돕는 서비스입니다.

---

## 🎯 제작 배경

- 정보를 쉽게 접할수 있는 시대이지만, 법은 여전히 우리에게 익숙치 않은 정보임.
- 매년 소송증가율이 늘어나며, 나홀로 소송을 준비하여 진행하는 경우도 증가.
- 기본적인 법률 지식을 알고만 있어도 법률 전문가와의 상담효율의 퀄리티가 달라짐.
- 다양한 판례 및 소송 결과 데이터를 바탕으로 관련 법률 지식을 확인 할 수 있음.

---

## 🛠 기술 스택
[![stackticon](https://firebasestorage.googleapis.com/v0/b/stackticon-81399.appspot.com/o/images%2F1772415971437?alt=media&token=5655fb96-f2cd-4d09-ba22-8e8c8392c414)](https://github.com/msdio/stackticon)


- **Frontend**: React, HTML, CSS, JavaScript, BootStrap, JSP  
- **Backend**: Spring Boot, Gradle, Python, JPA, Spring Security, REST API
- **Database**: Oracle  
- **AI**: Google Gemini API, Hugging Face  


---
## 📁 프로젝트 구조

```
LegalRiskAI/
 ├─ src/main/
 │   ├─ java/com/legal/ai/
 │   │   ├─ controller/    # API 엔드포인트 및 HTTP 요청 처리
 │   │   ├─ service/       # 비즈니스 로직 및 AI 모델 연동 (FastAPI 통신)
 │   │   ├─ repository/    # DB 접근 로직 (JPA/Oracle)
 │   │   ├─ dto/           # 데이터 전송 객체 (Data Transfer Object)
 │   │   └─ entity/        # DB 테이블 매핑 클래스
 │   ├─ resources/
 │   │   ├─ static/        # CSS, JavaScript, 이미지 파일
 │   │   ├─ templates/     # HTML (JSP/Thymeleaf) 템플릿
 │   │   └─ application.yml # 데이터베이스 및 서버 설정 파일
 ├─ .gitignore             # Git 관리 제외 파일 설정
 ├─ build.gradle           # 의존성 관리 및 빌드 설정 (Gradle)
 └─ README.md              # 프로젝트 설명 문서
```

---


## 🧩 주요 기능

- 👤 사용자 및 운영자 관리: 회원가입 / 로그인 / 마이페이지 및 운영자 대시보드
- 📈 승소율 예측 및 위험도 분석: 하이브리드 모델(ML+DL) 기반 승소 확률 도출 및 형량·벌금 리스크 수치화
- 🔍 지능형 유사 판례 검색: KR-SBERT 및 FAISS를 활용한 문맥 기반 유사 판례 매칭 및 상세 조회
- 📝 AI 판례 요약: 복잡한 판결문을 핵심 쟁점, 판시 요지, 결론으로 자동 요약 제공
- 💡 XAI 시각화: 유사도 점수에 영향을 준 핵심 키워드 및 문장을 하이라이팅하여 근거 제시

---

## 🔄 User Flow

1. 로그인 / 접속: 서비스 접속 및 사용자 인증
2. 사건 내용 입력: 분석을 원하는 사건의 구체적인 경위 및 텍스트 입력
3. AI 분석 실행: 사건 유형 분류, 승소율 예측, 리스크 식별 프로세스 진행
4. 유사 판례 매칭: 입력 사건과 가장 유사한 상위 판례 리스트 추출 및 RAG 기반 요약 생성
5. 분석 결과 확인: 예측 승소율, 예상 리스크, 요약된 판례 및 XAI 시각화 리포트 확인
6. 마이페이지 저장: 분석 결과 및 관심 판례 즐겨찾기 저장 및 관리

---

## 🖥 실행 화면

### 👤 회원 로그인 / 회원가입
(링크)

### ✍ 사건 입력 및 분석요청 화면
(링크)

### 🤖 사건분석 결과 화면(기능별)
(gif/결과%20페이지.gif)

## 🎥 전체 시연 영상
[▶️ Legal AI 전체 시연 영상 보기](링크)
---



## 🌱 프로젝트 회고

- 맡은 포지션 뿐만 아니라, 팀원간 맡은 포지션에 대한 기본 지식에 대한 중요성 인식
- docker 사용법과 배포에 대한 추가 학습 필요.
- ML/DL 학습률과 학습 성공여부에 대한 확인 체크리스트에 대한 중요성 인식.

---

## 🔮 향후 계획

- 판례 및 승소율 DATA set 단일화.
- ML/DL의 학습률과 학습 성공여부 체크리스트 작성 후 재학습 필요.
- 분석결과 제공용 피드백 용어 정리.(data set을 기반한 이전의 승소율과 판례를 알려준다는 내용으로 수정 필요)
- UI/UX 및 코드 구조 리팩토링.
- 


---

👥 Team 5조

<table>
<tr>

<td align="center" width="180">
<a href="https://github.com/sanghang33">
<img src="https://github.com/sanghang33.png?size=120" width="120" height="120" alt="유상진" />
</a><br/>
<b> PL 유상진</b><br/>
<sub>Full-stack</sub><br/>
<a href="https://github.com/sanghang33">@sanghang33</a>
</td>


<td align="center" width="180">
<a href="https://github.com/hj626">
<img src="https://github.com/hj626.png?size=120" width="120" height="120" alt="강혜정" />
</a><br/>
<b> PM 강혜정</b><br/>
<sub>WBS 관리/ML/DL/AI</sub><br/>
<a href="https://github.com/hj626">@hj626</a>
</td>


<td align="center" width="180">
<a href="https://github.com/timothykr7-jpg">
<img src="https://github.com/timothykr7-jpg.png?size=120" width="120" height="120" alt="나상훈" />
</a><br/>
<b>나상훈</b><br/>
<sub>QA</sub><br/>
<a href="https://github.com/timothykr7-jpg">@timothykr7-jpg</a>
</td>

<td align="center" width="180">
<a href="https://github.com/1st312">
<img src="https://github.com/1st312.png?size=120" width="120" height="120" alt="임다빈" />
</a><br/>
<b>임다빈</b><br/>
<sub>ML/DL/AI</sub><br/>
<a href="https://github.com/1st312">@1st312</a>
</td>
</tr>
</table>



