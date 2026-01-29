# 🚀 AI 법률 분석 시스템 - Ollama 설정 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [Ollama 설치 (팀원용)](#ollama-설치-팀원용)
3. [Qwen 모델 다운로드](#qwen-모델-다운로드)
4. [서버 실행](#서버-실행)
5. [문제 해결](#문제-해결)

---

## 시스템 개요

이 시스템은 **BERT + Qwen** 병행 분류 시스템입니다:

### ⚡ BERT 분류기
- **역할**: 빠른 1차 분류
- **특징**: 0.5초 내 분류 완료
- **정확도**: 97.6%
- **카테고리**: 가사, 민사, 세무, 일반행정, 특허, 형사

### 🧠 Qwen 2.5:7B LLM (Ollama)
- **역할**: 상세한 법적 분석
- **특징**: 분류 근거, 핵심 쟁점, 관련 법령 제공
- **속도**: 5-10초 소요
- **사용 가능 시에만** 추가 정보 제공

---

## ⚙️ Ollama 설치 (팀원용)

### Windows

1. **Ollama 설치**
   - 다운로드: https://ollama.com/download/windows
   - OllamaSetup.exe 실행 후 설치

2. **설치 확인**
   ```powershell
   ollama --version
   ```

3. **Ollama 서비스 시작** (자동으로 시작됨)
   - 포트: 11434
   - 확인: http://localhost:11434

### macOS

```bash
# 1. Ollama 설치
curl https://ollama.ai/install.sh | sh

# 2. 버전 확인
ollama --version
```

### Linux

```bash
# 1. Ollama 설치
curl https://ollama.ai/install.sh | sh

# 2. 서비스 시작
systemctl start ollama

# 3. 버전 확인
ollama --version
```

---

## 📥 Qwen 모델 다운로드

### 1. Qwen2.5:7b 다운로드 (필수)

```bash
ollama pull qwen2.5:7b
```

**다운로드 정보:**
- 크기: 약 4.7GB
- 소요 시간: 네트워크 속도에 따라 5-30분
- 저장 위치: 
  - Windows: `%USERPROFILE%\.ollama\models`
  - Mac/Linux: `~/.ollama/models`

### 2. 다운로드 확인

```bash
ollama list
```

**예상 출력:**
```
NAME             ID              SIZE      MODIFIED
qwen2.5:7b       3f8eb4da87fa    4.7 GB    2 minutes ago
```

### 3. 테스트

```bash
ollama run qwen2.5:7b "안녕하세요"
```

---

## 🎯 서버 실행

### 1. FastAPI 서버 시작

```powershell
# 1. 가상환경 활성화 (있는 경우)
# .\venv\Scripts\activate

# 2. Ollama 설치 확인
pip install langchain-ollama langchain-community

# 3. FastAPI 서버 실행
cd legal\unified_legal_ai
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001

```

**출력 예시:**
```
[OK] Ollama classifier ready: qwen2.5:7b
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### 2. React 프론트엔드 시작

```powershell
cd legal\FrontEnd\my-react-app
npm run dev
```

---

## 🧪 동작 확인

### 1. BERT만 동작 (Ollama 없을 때)

**UI 표시:**
```
🤖 AI 분류 결과
└── ⚡ BERT 분류기 (빠른 분류)
    ├── 유형: 민사
    ├── 신뢰도: 95.3%
    └── 레이블: 민사 사건 (계약/손해배상)

⚠️ Ollama LLM이 사용 불가능합니다. BERT 분류 결과만 표시됩니다.
```

### 2. BERT + Qwen 병행 (정상 동작)

**UI 표시:**
```
🤖 AI 분류 결과
├── ⚡ BERT 분류기 (빠른 분류)
│   ├── 유형: 민사
│   ├── 신뢰도: 95.3%
│   └── 레이블: 민사 사건 (계약/손해배상)
│
└── 🧠 Qwen 2.5:7B (상세 분석)
    ├── 유형: 민사 사건
    ├── 신뢰도: 92.1%
    ├── 분류 근거: "계약 위반과 손해배상 청구가 주요 쟁점이며..."
    ├── 핵심 쟁점: ["계약법", "소비자보호법"]
    └── 관련 법령: ["민법", "전자상거래법"]
```

---

## 🔧 문제 해결

### ❌ "Ollama not available"

**원인:** Ollama가 설치되지 않았거나 서비스가 실행 중이지 않음

**해결:**
```powershell
# 1. Ollama 실행 확인
ollama list

# 2. 서비스 재시작 (Windows)
# 작업 관리자에서 Ollama 종료 후 재시작

# 3. 포트 확인
curl http://localhost:11434
```

### ❌ "Model not found: qwen2.5:7b"

**원인:** 모델 다운로드가 완료되지 않음

**해결:**
```bash
# 모델 재다운로드
ollama pull qwen2.5:7b

# 모델 목록 확인
ollama list
```

### ❌ FastAPI 서버가 시작되지 않음

**원인:** langchain-ollama 패키지 미설치

**해결:**
```powershell
pip install langchain-ollama langchain-community
```

### ❌ Qwen 분석이 너무 느림

**정상입니다!**
- Qwen은 7B 파라미터 LLM이라 5-10초 소요
- BERT는 계속 빠르게 동작하므로 사용자는 BERT 결과를 먼저 볼 수 있음
- Qwen은 추가 정보로 제공됨

---

## 📊 성능 비교

| 항목 | BERT | Qwen 2.5:7B |
|------|------|-------------|
| 속도 | ⚡ 0.5초 | 🐢 5-10초 |
| 정확도 | 97.6% | ~95% |
| 분류만 | ✅ | ✅ |
| 근거 설명 | ❌ | ✅ |
| 핵심 쟁점 | ❌ | ✅ |
| 관련 법령 | ❌ | ✅ |

---

## 🚫 Ollama 없이 사용하기

**Ollama가 없어도 시스템은 정상 작동합니다!**

- BERT 분류기만으로 97.6% 정확도
- Qwen은 **선택사항**으로 추가 정보 제공
- UI에서 자동으로 BERT 결과만 표시

---

## 👥 협업 시 주의사항

### 분쟁유형 파트 담당자 (귀하)

✅ **수정 가능:**
- `classifier/bert_classifier.py`
- `classifier/ollama_classifier.py`
- `app/schemas.py` (ClassificationInfo, LLMAnalysis)
- `app/main.py` (1️⃣, 2️⃣ 분류 부분만)
- `FrontEnd/my-react-app/src/pages/boonjang.jsx` (Classification 섹션)

❌ **수정 금지:**
- `search/` (유사 판례 검색)
- `llm/` (Gemini 요약)
- 다른 페이지 (yusa.jsx, law.jsx 등)

---

## ❓ FAQ

**Q: Ollama는 필수인가요?**
A: 아니요! 선택사항입니다. BERT만으로도 충분히 동작합니다.

**Q: GPU가 필요한가요?**
A: Qwen은 CPU로도 동작합니다. GPU가 있으면 더 빠릅니다.

**Q: 다른 모델을 사용할 수 있나요?**
A: 가능합니다! `classifier/ollama_classifier.py`에서 `model_name` 변경하세요.
   - `qwen2.5:14b` (더 크고 정확)
   - `llama3:8b`
   - `mistral:7b`

**Q: 윈도우에서 한글이 깨져요**
A: Powershell 인코딩 설정: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`

---

## 📞 문의

문제가 발생하면:
1. 이 가이드의 "문제 해결" 섹션 확인
2. Ollama 공식 문서: https://ollama.com/docs
3. 팀 슬랙/디스코드에 문의

---

**작성일:** 2026-01-28
**버전:** 1.0
**담당:** 분쟁유형 파트
