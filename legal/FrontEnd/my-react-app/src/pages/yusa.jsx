import { Link } from "react-router-dom";
import { useState } from "react";

export default function Yusa() {
  const [yusaInput, setYusaInput] = useState("");
  const [yusaOutput, setYusaOutput] = useState("");
  const [yusaMark, setYusaMark] = useState(0);
  const [msg, setMsg] = useState("");

  const saveYusa = async () => {
    if (!yusaInput.trim()) {
      setMsg("내용을 입력하세요.");
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
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>유사위험</h2>

      <textarea
        value={yusaInput}
        onChange={(e) => setYusaInput(e.target.value)}
        rows={8}
        placeholder="사건 내용을 입력하세요..."
        style={{ width: "100%", padding: 12 }}
      />
                  <textarea
        value={yusaOutput}
        onChange={(e) => setYusaOutput(e.target.value)}
        rows={8}
        placeholder="사건 내용을 입력하세요..."
        style={{ width: "100%", padding: 12 }}
      />

      <label style={{ display: "block", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={yusaMark === 1}
          onChange={(e) => setYusaMark(e.target.checked ? 1 : 0)}
        />
        즐겨찾기
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
