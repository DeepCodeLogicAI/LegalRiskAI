import React, { useState } from "react";
import axios from "axios";

/* =========================
   판례 전문 파싱 유틸
========================= */
const extractSection = (text, title) => {
  if (!text) return null;
  
  const koreanBracketPattern = new RegExp(
    `【${title}】([\\s\\S]*?)(?=【[^】]+】|$)`,
    'i'
  );
  
  const englishBracketPattern = new RegExp(
    `\\[${title}\\]([\\s\\S]*?)(?=\\[[^\\]]+\\]|$)`,
    'i'
  );
  
  let match = text.match(koreanBracketPattern);
  if (match) return match[1].trim();
  
  match = text.match(englishBracketPattern);
  if (match) return match[1].trim();
  
  return null;
};

const extractSentence = (text) => {
  if (!text) return null;
  const jail = text.match(/징역\s*\d+년(\s*\d+월)?/);
  const fine = text.match(/벌금\s*[\d,]+원/);
  if (jail) return jail[0];
  if (fine) return fine[0];
  return null;
};

export default function Yusa() {
  const [inputText, setInputText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCases, setShowCases] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showIssues, setShowIssues] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const riskMap = {
    낮음: { score: 25, bar: "bg-green-500", text: "text-green-600" },
    중간: { score: 55, bar: "bg-yellow-500", text: "text-yellow-600" },
    높음: { score: 80, bar: "bg-red-500", text: "text-red-600" },
  };

  // 사건 유형별 아이콘
  const caseTypeIcons = {
    "형사": "⚖️",
    "가사": "👨‍👩‍👧",
    "노동": "👷",
    "전체": "📋"
  };

  // ------------------------
  // 1️⃣ AI 분석 (case_type 전송 제거!)
  // ------------------------
  const handleAnalyze = async () => {
    if (!inputText.trim()) return alert("사건 내용을 입력하세요.");

    setLoading(true);
    setAiResult(null);
    setSaveStatus(null);

    try {
      // ✅ case_type 필드 없음!
      const res = await axios.post("http://localhost:8000/analyze", {
        case_text: inputText,
      });
      
      console.log("✅ AI 분석 완료:", res.data);
      setAiResult(res.data);
    } catch (err) {
      console.error("❌ AI 분석 실패:", err);
      alert("AI 분석 실패");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // 2️⃣ 결과 저장
  // ------------------------
  const handleSaveYusa = async () => {
    if (!aiResult) return;

    const req = {
      yusa_input: inputText,
      yusa_output: aiResult.summary,
      yusa_mark: isFavorite ? 1 : 0,
      caseType: aiResult.inferred_case_type,  // ✅ 서버가 분류한 타입
    };

    try {
      const res = await axios.post("/api/yusa/save", req, {
        withCredentials: true,
      });
      setSaveStatus({ success: true, message: `저장 완료 (ID: ${res.data})` });
    } catch {
      setSaveStatus({ success: false, message: "저장 실패" });
    }
  };

  const highlightSummary = (text = "") =>
    text.split("\n").map((line, i) => (
      <p
        key={i}
        className={
          line.includes("쟁점") || line.includes("핵심")
            ? "bg-yellow-100 px-2 py-1 rounded mb-1"
            : "mb-1"
        }
      >
        {line}
      </p>
    ));

  const risk = aiResult ? riskMap[aiResult.overall_risk_level] : null;

  // ------------------------
  // 3️⃣ 판례 선택
  // ------------------------
  const handleSelectCase = async (c) => {
    const caseIdToUse = c.case_id || c.case_number;
    
    if (!caseIdToUse) {
      alert("이 판례는 전문을 조회할 수 없습니다.");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8000/case/${caseIdToUse}/full`);
      const fullData = res.data;

      setSelectedCase({
        ...fullData,
        summary: fullData.summary || c.xai_reason || "",
        case_name: fullData.case_name || c.case_name,
        full_text: fullData.full_text || "",
      });

      setShowIssues(false);
    } catch (err) {
      console.error("❌ 판례 전문 로드 실패:", err);
      alert("판례 전문 로드 실패");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== 입력 영역 ===== */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="font-bold text-xl mb-4">📝 사건 내용 입력</h2>
          
          {/* ✅ 사건 유형 드롭다운 제거! */}
          <p className="text-sm text-gray-600 mb-3">
            사건 내용을 자유롭게 작성하시면 AI가 자동으로 분석합니다.
          </p>

          <textarea
            className="w-full h-72 border rounded-lg p-4 bg-gray-50 text-sm"
            placeholder="예시: 임대한 집에 누수가 심해서 살 수 없을 정도였는데, 집주인이 수리를 해주지 않았습니다. 계약 기간이 남았지만 먼저 이사를 갔고, 보증금을 전액 돌려받고 싶습니다..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "🔄 AI 분석 중..." : "🚀 AI 분석 시작"}
          </button>
        </div>

        {/* ===== 결과 영역 ===== */}
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col">
          <h2 className="font-bold text-xl mb-4">📊 분석 결과</h2>

          {aiResult && (
            <>
              {/* ✅ 자동 분류 결과 표시 */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {caseTypeIcons[aiResult.inferred_case_type] || "📋"}
                  </span>
                  <strong className="text-lg">
                    AI 판단: {aiResult.case_type_label}
                  </strong>
                  <span className="text-sm text-gray-600">
                    (신뢰도: {Math.round(aiResult.case_type_confidence * 100)}%)
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {aiResult.case_type_description}
                </p>
              </div>

              {/* 리스크 */}
              {risk && (
                <div className="mb-4">
                  <p className={`font-bold ${risk.text} text-lg`}>
                    리스크: {aiResult.overall_risk_level}
                  </p>
                  <div className="bg-gray-200 h-3 rounded-full">
                    <div
                      className={`${risk.bar} h-3 rounded-full transition-all`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 요약 */}
              <div className="text-sm mb-4 p-3 bg-yellow-50 rounded border">
                {highlightSummary(aiResult.summary)}
              </div>

              {/* 유사 판례 */}
              <button
                onClick={() => setShowCases(!showCases)}
                className="text-blue-600 font-medium hover:underline mb-2"
              >
                {showCases ? "📂 판례 접기" : `📂 유사 판례 ${aiResult.similar_cases.length}건 보기`}
              </button>

              {showCases &&
                aiResult.similar_cases.map((c, i) => (
                  <div
                    key={i}
                    className="border p-3 mt-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => handleSelectCase(c)}
                  >
                    <div className="flex justify-between items-start">
                      <strong className="text-sm">{c.case_name}</strong>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {c.case_type_label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {c.court} · 유사도 {Math.round(c.similarity * 100)}%
                    </p>
                  </div>
                ))}

              {/* 저장 */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                  />
                  <span className="text-sm">즐겨찾기</span>
                </label>

                <button
                  onClick={handleSaveYusa}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  💾 결과 저장
                </button>
              </div>

              {saveStatus && (
                <div className="mt-2 text-sm font-bold">
                  {saveStatus.success ? "✅ " : "❌ "}
                  {saveStatus.message}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== 판례 모달 ===== */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl mb-4">{selectedCase.case_name}</h3>

            {selectedCase.summary && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <strong className="block mb-2">📝 요약</strong>
                <pre className="text-sm whitespace-pre-wrap text-gray-700">
                  {selectedCase.summary}
                </pre>
              </div>
            )}

            {extractSection(selectedCase.full_text, "주\\s*문") && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <strong className="block mb-2">⚖️ 주 문</strong>
                <pre className="text-sm whitespace-pre-wrap text-gray-700">
                  {extractSection(selectedCase.full_text, "주\\s*문")}
                </pre>
              </div>
            )}

            {extractSentence(selectedCase.full_text) && (
              <div className="mb-4 p-3 bg-orange-50 rounded border">
                <strong className="text-red-700">
                  형량: {extractSentence(selectedCase.full_text)}
                </strong>
              </div>
            )}

            <button
              onClick={() => setShowIssues(!showIssues)}
              className="mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showIssues ? "📖 판시사항 닫기" : "📖 판시사항 보기"}
            </button>

            {showIssues && extractSection(selectedCase.full_text, "판시사항") && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border">
                <strong className="block mb-2">판시사항</strong>
                <pre className="text-sm whitespace-pre-wrap text-gray-700">
                  {extractSection(selectedCase.full_text, "판시사항")}
                </pre>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer font-bold text-gray-700 hover:text-blue-600">
                📄 판례 전문 보기
              </summary>
              <div className="mt-3 p-4 bg-gray-50 rounded border">
                <pre className="text-xs whitespace-pre-wrap text-gray-600">
                  {selectedCase.full_text}
                </pre>
              </div>
            </details>

            <button
              onClick={() => setSelectedCase(null)}
              className="mt-4 w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
