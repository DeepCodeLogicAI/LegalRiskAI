import React, { useState } from "react";
import axios from "axios";

/* =========================
   판례 전문 파싱 유틸
========================= */
const extractSection = (text, title) => {
  if (!text) return null;
  const regex = new RegExp(`${title}([\\s\\S]*?)(?=\\n\\[[^\\]]+\\]|$)`);
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

const extractSentence = (text) => {
  if (!text) return null;

  const jail = text.match(/징역\s*\d+년(\s*\d+월)?/);
  const fine = text.match(/벌금\s*\d+원/);

  if (jail) return jail[0];
  if (fine) return fine[0];
  return null;
};

export default function Yusa() {
  const [caseType, setCaseType] = useState("민사");
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

  // ------------------------
  // 1️⃣ AI 분석
  // ------------------------
  const handleAnalyze = async () => {
    if (!inputText.trim()) return alert("사건 내용을 입력하세요.");

    setLoading(true);
    setAiResult(null);
    setSaveStatus(null);

    try {
      // ✅ FastAPI 직접 호출 (프록시 우회)
      const res = await axios.post("http://localhost:8000/analyze", {
        case_type: caseType,
        case_text: inputText,
      });
      
      console.log("✅ AI 분석 완료");
      console.log("응답 전체:", res.data);
      console.log("similar_cases:", res.data.similar_cases);
      console.log("case_id 목록:", res.data.similar_cases.map(c => c.case_id));
      
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
      caseType,
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
  // 3️⃣ 판례 선택 시 full_text + summary fetch
  // ------------------------
  const handleSelectCase = async (c) => {
    console.log("🔍 판례 클릭됨!");
    console.log("전체 객체:", c);
    console.log("case_id:", c.case_id);
    console.log("case_number:", c.case_number);
    
    // ✅ case_id 또는 case_number 사용
    const caseIdToUse = c.case_id || c.case_number;
    
    if (!caseIdToUse) {
      console.error("❌ case_id와 case_number 모두 없음!");
      alert("이 판례는 전문을 조회할 수 없습니다. (사건번호 누락)");
      return;
    }

    try {
      console.log(`📡 API 요청: /case/${caseIdToUse}/full`);
      const res = await axios.get(`http://localhost:8000/case/${caseIdToUse}/full`);
      console.log("✅ API 응답 받음:", res.data);
      
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
      
      if (err.response?.status === 404) {
        alert(`사건번호 ${caseIdToUse}를 찾을 수 없습니다.`);
      } else {
        alert("판례 전문 로드 실패");
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 */}
        <div className="bg-white p-6 rounded border">
          <h2 className="font-bold mb-3">📝 사건 입력</h2>

          <select
            className="border p-2 rounded mb-3"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
          >
            <option>민사</option>
            <option>형사</option>
            <option>노동</option>
            <option>가사</option>
          </select>

          <textarea
            className="w-full h-64 border rounded p-3 bg-gray-50"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button
            onClick={handleAnalyze}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
          >
            {loading ? "분석 중..." : "AI 분석"}
          </button>
        </div>

        {/* 결과 */}
        <div className="bg-white p-6 rounded border flex flex-col">
          <h2 className="font-bold mb-3">📊 분석 결과</h2>

          {aiResult && (
            <>
              {risk && (
                <div className="mb-3">
                  <p className={`font-bold ${risk.text}`}>
                    리스크: {aiResult.overall_risk_level}
                  </p>
                  <div className="bg-gray-200 h-2 rounded">
                    <div
                      className={`${risk.bar} h-2 rounded`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="text-sm mb-3">{highlightSummary(aiResult.summary)}</div>

              <button
                onClick={() => setShowCases(!showCases)}
                className="text-blue-600 text-sm"
              >
                {showCases ? "판례 접기" : "유사 판례 보기"}
              </button>

              {showCases &&
                aiResult.similar_cases.map((c, i) => (
                  <div
                    key={i}
                    className="border p-2 mt-2 rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectCase(c)}
                  >
                    <strong>{c.case_name}</strong>
                    <p className="text-xs text-gray-500">
                      {c.court} · {Math.round(c.similarity * 100)}%
                    </p>
                  </div>
                ))}

              <div className="flex justify-between items-center mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                  />
                  즐겨찾기
                </label>

                <button
                  onClick={handleSaveYusa}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  결과 저장
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

      {/* 판례 모달 */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-[750px] max-h-[85vh] overflow-y-auto">
            <h3 className="font-bold text-lg">{selectedCase.case_name}</h3>

            {selectedCase.summary && (
              <div className="mt-3 p-3 bg-yellow-50 rounded">
                <strong>요약</strong>
                <pre className="text-sm whitespace-pre-wrap">{selectedCase.summary}</pre>
              </div>
            )}

            {selectedCase.full_text && (
              <div className="mt-3 p-3 bg-blue-50 rounded">
                <strong>전문</strong>
                <pre className="text-sm whitespace-pre-wrap">{selectedCase.full_text}</pre>
              </div>
            )}

            {extractSection(selectedCase.full_text, "[주 문]") && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <strong>[주 문]</strong>
                <pre className="text-sm whitespace-pre-wrap">
                  {extractSection(selectedCase.full_text, "[주 문]")}
                </pre>
              </div>
            )}

            {caseType === "형사" && (
              <p className="mt-2 text-red-700 font-bold">
                형량: {extractSentence(selectedCase.full_text) || "확인 불가"}
              </p>
            )}

            <button
              onClick={() => setShowIssues(!showIssues)}
              className="mt-3 text-blue-600 text-sm font-bold"
            >
              {showIssues ? "판시사항 닫기" : "판시사항 보기"}
            </button>

            {showIssues && (
              <pre className="mt-2 text-xs bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {extractSection(selectedCase.full_text, "[판시사항]") || "판시사항 없음"}
              </pre>
            )}

            <button
              onClick={() => setSelectedCase(null)}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
