import React, { useState } from "react";
import axios from "axios";

export default function Yusa() {
  const [caseType, setCaseType] = useState("민사");
  const [inputText, setInputText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCases, setShowCases] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const riskMap = {
    LOW: { score: 25, bar: "bg-green-500", text: "text-green-600" },
    MEDIUM: { score: 55, bar: "bg-yellow-500", text: "text-yellow-600" },
    HIGH: { score: 80, bar: "bg-red-500", text: "text-red-600" },
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      alert("사건 내용을 입력하세요.");
      return;
    }

    setLoading(true);
    setAiResult(null);

    try {
      const res = await axios.post("/api/ai/analyze", {
        case_type: caseType,
        case_text: inputText,
      });

      console.log("AI RESPONSE", res.data); // ★ 반드시 확인
      setAiResult(res.data);
    } catch (e) {
      console.error(e);
      alert("AI 분석 실패");
    } finally {
      setLoading(false);
    }
  };

  const highlightSummary = (text = "") =>
    text.split("\n").map((line, i) => (
      <p
        key={i}
        className={
          line.includes("법적") || line.includes("소송")
            ? "bg-yellow-100 px-2 py-1 rounded mb-1"
            : "mb-1"
        }
      >
        {line}
      </p>
    ));

  const risk = aiResult ? riskMap[aiResult.overall_risk_level] : null;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 입력 */}
        <div className="bg-white rounded-xl p-6 border shadow-sm flex flex-col">
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
            className="flex-1 border rounded p-3 resize-none bg-gray-50"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="사건 사실관계를 입력하세요"
          />

          <button
            onClick={handleAnalyze}
            className="mt-4 py-3 bg-blue-500 text-white rounded font-bold"
          >
            {loading ? "분석 중..." : "AI 분석"}
          </button>
        </div>

        {/* 결과 */}
        <div className="bg-white rounded-xl p-6 border shadow-sm flex flex-col">
          <h2 className="font-bold mb-3">📊 분석 결과</h2>

          {!aiResult && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              분석 결과가 여기에 표시됩니다.
            </div>
          )}

          {aiResult && (
            <>
              {/* 리스크 */}
              {risk && (
                <div className="mb-4">
                  <p className={`font-bold ${risk.text}`}>
                    리스크: {aiResult.overall_risk_level}
                  </p>
                  <div className="w-full bg-gray-200 h-3 rounded mt-1">
                    <div
                      className={`${risk.bar} h-3 rounded`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 요약 */}
              <div className="flex-1 overflow-auto text-sm mb-3">
                {highlightSummary(aiResult.summary)}
              </div>

              {/* 판례 */}
              {aiResult.similar_cases?.length > 0 && (
                <>
                  <button
                    onClick={() => setShowCases(!showCases)}
                    className="text-blue-500 text-sm mb-2"
                  >
                    {showCases ? "판례 접기" : "유사 판례 보기"}
                  </button>

                  {showCases && (
                    <ul className="space-y-2 text-sm">
                      {aiResult.similar_cases.map((c, i) => (
                        <li
                          key={i}
                          className="border p-2 rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedCase(c)}
                        >
                          <strong>{c.case_name}</strong>
                          <p className="text-xs text-gray-500">
                            {c.court} · 유사도 {Math.round(c.similarity * 100)}%
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 모달 */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[500px]">
            <h3 className="font-bold mb-2">{selectedCase.case_name}</h3>
            <p>법원: {selectedCase.court}</p>
            <p>사건번호: {selectedCase.case_number}</p>
            <p>결과: {selectedCase.outcome}</p>
            <p className="mt-2 bg-yellow-100 p-2 rounded text-sm">
              {selectedCase.xai_reason}
            </p>
            <button
              onClick={() => setSelectedCase(null)}
              className="mt-4 w-full py-2 bg-gray-800 text-white rounded"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}