import React, { useState } from "react";
import axios from "axios";

/* =========================
   🆕 YUSA 판례 전문 파싱 유틸 (Yusa.jsx에서 가져옴)
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

/**
 * AI 사건 분석 페이지 - Tailwind CSS
 * 
 * 레이아웃:
 * - 중앙 정렬 제목
 * - 왼쪽: 입력 폼
 * - 오른쪽: 탭 결과
 * 
 * 🆕 수정사항:
 * 1. "상세 판례 분석" 탭 추가 (Yusa 기능)
 * 2. Yusa 전용 상태 관리 추가
 * 3. Yusa API 연동 추가
 */
export default function AIAnalysis() {
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState("dispute");
    const [analysisResult, setAnalysisResult] = useState(null);
    const [riskResult, setRiskResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // 🆕 YUSA 전용 상태 관리
    const [yusaResult, setYusaResult] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showIssues, setShowIssues] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [yusaSaveStatus, setYusaSaveStatus] = useState(null);

    const API_BASE = "http://localhost:8000";

    // 🆕 수정: "유사 판례" 탭을 Yusa 기능으로 교체
    const tabs = [
        { id: "dispute", label: "분쟁 유형", icon: "⚖️" },
        { id: "risk", label: "법적 리스크", icon: "⚠️" },
        { id: "similar", label: "유사 판례", icon: "🔍" }, // 🆕 Yusa 기능으로 교체됨
        { id: "solution", label: "해결 전략", icon: "💡" }
    ];

    // 🆕 Yusa에서 가져온 리스크 맵
    const riskMap = {
        낮음: { score: 25, bar: "bg-green-500", text: "text-green-600" },
        중간: { score: 55, bar: "bg-yellow-500", text: "text-yellow-600" },
        높음: { score: 80, bar: "bg-red-500", text: "text-red-600" },
    };

    // 🆕 Yusa에서 가져온 사건 유형별 아이콘
    const caseTypeIcons = {
        "형사": "⚖️",
        "가사": "👨‍👩‍👧",
        "노동": "👷",
        "전체": "📋"
    };

    // 기존 분석 함수 (분쟁 유형, 법적 리스크, 해결 전략 탭용)
    const handleAnalyze = async () => {
        if (!inputText.trim()) {
            alert("사건의 사실관계를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setStatusMessage(null);

        try {
            console.log("=== 🚀 AI 분석 시작 ===");
            console.log("📝 입력 텍스트:", inputText);
            console.log("📏 텍스트 길이:", inputText.length, "자");

            // 1. 분쟁 유형 및 유사 판례 분석
            console.log("\n[1/2] 분쟁 유형 분석 중...");
            const analyzeRes = await axios.post(`${API_BASE}/analyze`, {
                case_text: inputText
            });
            console.log("✅ 분쟁 유형 분석 완료:");
            console.log("📋 분류:", analyzeRes.data.classification?.inferred_type);
            console.log("📊 신뢰도:", (analyzeRes.data.classification?.confidence * 100).toFixed(1) + "%");
            console.log("🔍 유사 판례:", analyzeRes.data.similar_cases?.length, "건");
            console.log("💡 요약:", analyzeRes.data.summary);
            console.log("📦 전체 응답 데이터:", analyzeRes.data);
            setAnalysisResult(analyzeRes.data);

            // 2. 리스크 분석
            console.log("\n[2/2] 리스크 분석 중...");
            try {
                const riskRes = await axios.post(`${API_BASE}/risk-analyze`, {
                    case_text: inputText
                });
                console.log("✅ 리스크 분석 완료:");
                console.log("📊 예상 승소율:", riskRes.data.win_rate?.toFixed(1) + "%");
                console.log("⚠️ 위험도:", riskRes.data.risk?.toFixed(0) + "/100");
                console.log("⚖️ 예상 형량:", riskRes.data.sentence?.toFixed(1), "년");
                console.log("💰 예상 벌금:", riskRes.data.fine?.toLocaleString(), "원");
                console.log("📦 전체 리스크 데이터:", riskRes.data);
                setRiskResult(riskRes.data);
            } catch (riskError) {
                console.warn("⚠️ 리스크 분석 실패 (선택 기능):", riskError.message);
                setRiskResult(null);
            }

            setStatusMessage({ success: true, message: "분석 완료!" });
            console.log("\n=== ✅ AI 분석 완료 ===\n");

        } catch (error) {
            console.error("\n=== ❌ AI 분석 오류 ===");
            console.error("오류 메시지:", error.message);
            console.error("오류 상세:", error.response?.data);
            console.error("전체 오류 객체:", error);
            setStatusMessage({
                success: false,
                message: error.response?.data?.detail || "AI 분석 중 오류가 발생했습니다."
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 🆕 YUSA 전용 분석 함수 (유사 판례 탭에서만 사용)
    const handleYusaAnalyze = async () => {
        if (!inputText.trim()) {
            alert("사건 내용을 입력하세요.");
            return;
        }

        setIsLoading(true);
        setYusaResult(null);
        setYusaSaveStatus(null);

        try {
            console.log("=== 🚀 YUSA AI 분석 시작 ===");
            const res = await axios.post("http://localhost:8000/analyze", {
                case_text: inputText,
            });

            console.log("✅ YUSA AI 분석 완료:", res.data);
            setYusaResult(res.data);
        } catch (err) {
            console.error("❌ YUSA AI 분석 실패:", err);
            alert("AI 분석 실패");
        } finally {
            setIsLoading(false);
        }
    };

    // 🆕 YUSA 결과 저장 함수 (Yusa.jsx에서 가져옴)
    const handleSaveYusa = async () => {
        if (!yusaResult) return;

        const req = {
            yusa_input: inputText,
            yusa_output: yusaResult.summary,
            yusa_mark: isFavorite ? 1 : 0,
            caseType: yusaResult.inferred_case_type,
        };

        try {
            const res = await axios.post("/api/yusa/save", req, {
                withCredentials: true,
            });
            setYusaSaveStatus({ success: true, message: "저장 성공!" }); // 🆕 메시지 변경
        } catch {
            setYusaSaveStatus({ success: false, message: "저장 실패" });
        }
    };

    // 🆕 YUSA 판례 선택 함수 (Yusa.jsx에서 가져옴)
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

    // 🆕 YUSA 요약 하이라이트 함수 (Yusa.jsx에서 가져옴)
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

    // 결과 복사 함수 (변경 없음)
    const handleCopyResults = () => {
        if (!analysisResult) {
            alert("복사할 결과가 없습니다.");
            return;
        }

        let copyText = "=== AI 사건 분석 결과 ===\n\n";
        copyText += `📝 입력 사실관계:\n${inputText}\n\n`;

        // 분쟁 유형
        if (analysisResult.classification) {
            copyText += "📋 분쟁 유형:\n";
            copyText += `- 분류: ${analysisResult.classification.inferred_type}\n`;
            copyText += `- 신뢰도: ${(analysisResult.classification.confidence * 100).toFixed(1)}%\n`;

            if (analysisResult.classification.llm_analysis?.available) {
                copyText += `- LLM 분석: ${analysisResult.classification.llm_analysis.category}\n`;
                if (analysisResult.classification.llm_analysis.reasoning) {
                    copyText += `- 분석 근거: ${analysisResult.classification.llm_analysis.reasoning}\n`;
                }
            }
            copyText += "\n";
        }

        // 리스크
        if (riskResult?.success) {
            copyText += "⚠️ 법적 리스크:\n";
            copyText += `- 예상 승소율: ${riskResult.win_rate?.toFixed(1)}%\n`;
            copyText += `- 위험도: ${riskResult.risk?.toFixed(0)}/100\n`;
            if (riskResult.sentence > 0.1) {
                copyText += `- 예상 형량: ${riskResult.sentence?.toFixed(1)}년\n`;
            }
            if (riskResult.fine > 10000) {
                copyText += `- 예상 벌금: ${riskResult.fine?.toLocaleString()}원\n`;
            }
            copyText += "\n";
        }

        // 유사 판례
        if (analysisResult.similar_cases?.length > 0) {
            copyText += "🔍 유사 판례:\n";
            analysisResult.similar_cases.forEach((c, i) => {
                copyText += `${i + 1}. ${c.case_name} (유사도: ${(c.similarity * 100).toFixed(1)}%)\n`;
            });
            copyText += "\n";
        }

        // 해결 전략
        if (analysisResult.summary) {
            copyText += "💡 해결 전략:\n";
            copyText += analysisResult.summary + "\n";
        }

        navigator.clipboard.writeText(copyText).then(() => {
            alert("결과가 클립보드에 복사되었습니다!");
            console.log("📋 복사 완료!");
            console.log("복사된 내용:\n", copyText);
        }).catch(err => {
            console.error("❌ 복사 실패:", err);
            alert("복사에 실패했습니다.");
        });
    };

    // DB 저장 함수 (기존 백엔드 API 사용) (변경 없음)
    const handleSaveAnalysis = async () => {
        if (!analysisResult) {
            alert("저장할 분석 결과가 없습니다.");
            return;
        }

        try {
            console.log("\n=== 💾 DB 저장 시작 ===");

            // 모든 결과를 JSON으로 합쳐서 output에 저장
            const outputData = {
                classification: analysisResult.classification,
                risk: riskResult,
                similarCases: analysisResult.similar_cases,
                summary: analysisResult.summary
            };

            const saveData = {
                boonjang_input: inputText,
                boonjang_output: JSON.stringify(outputData, null, 2),
                boonjang_mark: 0  // 기본값: 즐겨찾기 아님
            };

            console.log("💾 저장할 데이터:", saveData);

            const response = await axios.post("http://localhost:8484/api/boonjang/save", saveData);

            console.log("✅ 저장 성공! 저장된 코드:", response.data);
            alert(`분석 결과가 저장되었습니다! (코드: ${response.data})`);

        } catch (error) {
            console.error("❌ 저장 오류:", error);
            console.error("오류 상세:", error.response?.data);

            if (error.response?.status === 401) {
                alert("로그인이 필요한 서비스입니다.");
            } else {
                alert("저장 중 오류가 발생했습니다.");
            }
        }
    };

    // 🆕 수정: 탭 컨텐츠 렌더링 (similar 탭만 독립적으로 작동)
    const renderTabContent = () => {
        // 유사 판례 탭은 별도로 처리
        if (activeTab === "similar") {
            return renderYusaTab();
        }

        // 로딩 중일 때 스피너 표시 (다른 탭들용)
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">AI 분석 진행 중...</h3>
                    <p className="text-sm text-slate-600">잠시만 기다려주세요. 최적의 결과를 도출하고 있습니다.</p>
                </div>
            );
        }

        if (!analysisResult && !riskResult) {
            // 분석 전 - 각 탭에 맞는 안내 표시
            const emptyStates = {
                dispute: {
                    icon: "⚖️",
                    title: "분쟁 유형 분석",
                    description: "사건의 법적 성격을 규명하고 핵심 쟁점을 도출합니다."
                },
                risk: {
                    icon: "⚠️",
                    title: "법적 리스크 분석",
                    description: "예상 승소율, 위험도, 형량, 벌금 등을 AI로 예측합니다."
                },
                solution: {
                    icon: "💡",
                    title: "해결 전략",
                    description: "AI 전문가 피드백과 권장 대응 방안을 제시합니다."
                }
            };

            const currentState = emptyStates[activeTab];

            return (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="text-6xl mb-4">{currentState.icon}</div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{currentState.title}</h3>
                    <p className="text-slate-600 mb-8">{currentState.description}</p>

                    <div className="space-y-3 w-full max-w-sm">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                            <span className="text-sm text-slate-700">사건 사실관계 입력</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                            <span className="text-sm text-slate-700">AI 분석 시작 버튼 클릭</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                            <span className="text-sm text-blue-700 font-medium">결과 확인</span>
                        </div>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case "dispute":
                return renderDisputeTab();
            case "risk":
                return renderRiskTab();
            case "solution":
                return renderSolutionTab();
            default:
                return null;
        }
    };

    const renderDisputeTab = () => {
        const classification = analysisResult?.classification;
        const llm = classification?.llm_analysis;

        return (
            <div className="space-y-6 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 분쟁 유형 분석 결과</h3>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">🤖 AI 자동 분류 (BERT)</h4>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">분류:</span>
                        <span className="text-base font-semibold text-blue-600">{classification?.inferred_type || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">신뢰도:</span>
                        <span className="text-base text-slate-800">{(classification?.confidence * 100).toFixed(1)}%</span>
                    </div>
                </div>

                {llm?.available && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                        <h4 className="text-base font-semibold text-slate-800 mb-4">🧠 LLM 상세 분석 (Qwen)</h4>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-slate-600">카테고리:</span>
                            <span className="text-base text-slate-800">{llm.category || "-"}</span>
                        </div>
                        {llm.reasoning && (
                            <div className="mb-4">
                                <span className="text-sm font-medium text-slate-700 block mb-2">분석 근거:</span>
                                <p className="text-sm text-slate-600 leading-relaxed">{llm.reasoning}</p>
                            </div>
                        )}
                        {llm.key_points?.length > 0 && (
                            <div>
                                <span className="text-sm font-medium text-slate-700 block mb-2">핵심 쟁점:</span>
                                <ul className="space-y-1.5">
                                    {llm.key_points.map((point, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="text-purple-500 mt-0.5">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderRiskTab = () => {
        if (!riskResult?.success) {
            return (
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">⚠️ 법적 리스크 분석</h3>
                    <p className="text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">위험도 분석 서비스를 사용할 수 없습니다.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">⚠️ 법적 리스크 분석 결과</h3>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">📊 예상 승소율</h4>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-600">승소 가능성:</span>
                        <span className="text-xl font-bold text-green-600">{riskResult.win_rate?.toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-slate-600">현재 사건의 예상 승소율입니다. AI가 유사 판례를 분석하여 산출한 결과입니다.</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">⚠️ 위험도 평가</h4>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-600">위험도 점수:</span>
                        <span className="text-xl font-bold text-amber-600">{riskResult.risk?.toFixed(0)}/100</span>
                    </div>
                    <p className="text-sm text-slate-600">법적 위험도를 100점 만점으로 평가한 점수입니다. 높을수록 주의가 필요합니다.</p>
                </div>

                {riskResult.sentence > 0.1 && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                        <h4 className="text-base font-semibold text-slate-800 mb-4">⚖️ 예상 형량</h4>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-slate-600">형량:</span>
                            <span className="text-xl font-bold text-red-600">{riskResult.sentence?.toFixed(1)}년</span>
                        </div>
                        <p className="text-sm text-slate-600">유사 사건의 판례를 기반으로 예상되는 형량입니다.</p>
                    </div>
                )}

                {riskResult.fine > 10000 && (
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
                        <h4 className="text-base font-semibold text-slate-800 mb-4">💰 예상 벌금</h4>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-slate-600">벌금액:</span>
                            <span className="text-xl font-bold text-violet-600">{riskResult.fine?.toLocaleString()}원</span>
                        </div>
                        <p className="text-sm text-slate-600">유사 사건의 판례를 기반으로 예상되는 벌금액입니다.</p>
                    </div>
                )}
            </div>
        );
    };

    // 🆕 renderSimilarTab 함수는 제거됨 (Yusa 기능으로 완전히 교체)

    const renderSolutionTab = () => {
        const feedback = riskResult?.feedback;
        const summary = analysisResult?.summary;

        return (
            <div className="space-y-6 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">💡 해결 전략</h3>

                {summary && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="text-base font-semibold text-slate-800 mb-4">📝 AI 분석 요약</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
                    </div>
                )}

                {feedback && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                        <h4 className="text-base font-semibold text-slate-800 mb-4">🤖 전문가 피드백 (Gemini)</h4>
                        <div className="space-y-2">
                            {feedback.split('\n').map((line, i) => (
                                <p key={i} className="text-sm text-slate-700 leading-relaxed">{line}</p>
                            ))}
                        </div>
                    </div>
                )}

                {!summary && !feedback && (
                    <p className="text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">해결 전략 정보가 없습니다.</p>
                )}
            </div>
        );
    };

    // 🆕 YUSA 탭 렌더링 함수 (기존 유사 판례 탭을 완전히 교체)
    const renderYusaTab = () => {
        const risk = yusaResult ? riskMap[yusaResult.overall_risk_level] : null;

        return (
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">🔍 유사 판례</h3>
                    
                    {/* 🆕 유사 판례 전용 분석 버튼 */}
                    {!yusaResult && (
                        <button
                            onClick={handleYusaAnalyze}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? "🔄 분석 중..." : "✨ 분석 시작하기"}
                        </button>
                    )}
                </div>

                {/* 로딩 상태 */}
                {isLoading && !yusaResult && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-sm text-slate-600">유사 판례 분석 진행 중...</p>
                    </div>
                )}

                {/* 분석 전 안내 */}
                {!yusaResult && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">유사 판례 분석</h3>
                        <p className="text-slate-600 mb-8">사건 유형 자동 분류, 복수 유형 감지, 리스크 평가 및 판례 상세 정보를 제공합니다.</p>
                        
                        <div className="space-y-3 w-full max-w-sm">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                                <span className="text-sm text-slate-700">사건 내용 입력</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                                <span className="text-sm text-slate-700">분석 시작하기 클릭</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                                <span className="text-sm text-blue-700 font-medium">판례 전문 및 상세 정보 확인</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🆕 YUSA 분석 결과 표시 */}
                {yusaResult && (
                    <>
                        {/* 자동 분류 결과 */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">
                                    {caseTypeIcons[yusaResult.inferred_case_type] || "📋"}
                                </span>
                                <strong className="text-lg">
                                    AI 판단: {yusaResult.case_type_label}
                                </strong>
                                <span className="text-sm text-gray-600">
                                    (신뢰도: {Math.round(yusaResult.case_type_confidence * 100)}%)
                                </span>
                            </div>
                            <p className="text-sm text-gray-700">
                                {yusaResult.case_type_description}
                            </p>
                        </div>

                        {/* 복수 유형 표시 */}
                        {yusaResult.search_result_types && yusaResult.search_result_types.is_mixed && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">🔀</span>
                                    <strong className="text-base">복수 유형 감지</strong>
                                </div>

                                <p className="text-sm text-gray-700 mb-3">
                                    검색된 판례가 여러 사건 유형에 걸쳐있습니다:
                                </p>

                                {/* 유형별 바 차트 */}
                                <div className="space-y-2 mb-3">
                                    {Object.entries(yusaResult.search_result_types.distribution)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([type, count]) => {
                                            const percentage = yusaResult.search_result_types.percentages[type];
                                            return (
                                                <div key={type} className="flex items-center gap-2">
                                                    <span className="text-xs w-16 font-medium text-gray-600">{type}</span>
                                                    <div className="flex-1 bg-gray-200 h-5 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-purple-500 h-5 rounded-full flex items-center justify-end pr-2"
                                                            style={{ width: `${percentage * 100}%` }}
                                                        >
                                                            {percentage >= 0.15 && (
                                                                <span className="text-xs text-white font-medium">
                                                                    {Math.round(percentage * 100)}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs w-12 text-right text-gray-500">
                                                        {count}건
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>

                                {/* 특별 노트 */}
                                {yusaResult.search_result_types.note && (
                                    <div className="flex items-start gap-2 p-3 bg-purple-100 rounded-lg">
                                        <span className="text-lg">💡</span>
                                        <p className="text-sm text-purple-800 flex-1">
                                            {yusaResult.search_result_types.note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 리스크 평가 */}
                        {risk && (
                            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                <p className={`font-bold ${risk.text} text-lg mb-2`}>
                                    리스크: {yusaResult.overall_risk_level}
                                </p>
                                <div className="bg-gray-200 h-3 rounded-full">
                                    <div
                                        className={`${risk.bar} h-3 rounded-full transition-all`}
                                        style={{ width: `${risk.score}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* AI 요약 */}
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <strong className="block mb-2 text-sm font-semibold text-slate-800">📝 AI 분석 요약</strong>
                            <div className="text-sm text-slate-700">
                                {highlightSummary(yusaResult.summary)}
                            </div>
                        </div>

                        {/* 유사 판례 목록 */}
                        {yusaResult.similar_cases && yusaResult.similar_cases.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-800">
                                    🔍 유사 판례 {yusaResult.similar_cases.length}건
                                </h4>
                                
                                {yusaResult.similar_cases.map((c, i) => (
                                    <div
                                        key={i}
                                        className="border border-slate-200 p-4 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition"
                                        onClick={() => handleSelectCase(c)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <strong className="text-sm text-slate-800">{c.case_name}</strong>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                {c.case_type_label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {c.court} · 유사도 {Math.round(c.similarity * 100)}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 저장 옵션 */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isFavorite}
                                    onChange={(e) => setIsFavorite(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm text-slate-700">즐겨찾기</span>
                            </label>

                            <button
                                onClick={handleSaveYusa}
                                className="bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700 transition"
                            >
                                💾 결과 저장
                            </button>
                        </div>

                        {yusaSaveStatus && (
                            <div className={`p-3 rounded-lg text-sm font-medium ${
                                yusaSaveStatus.success 
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {yusaSaveStatus.success ? "✅ " : "❌ "}
                                {yusaSaveStatus.message}
                            </div>
                        )}

                        {/* 🆕 저장 완료/실패 알림 (화면에 표시) */}
                        {!yusaResult && yusaSaveStatus && (
                            <div className={`p-4 rounded-lg text-sm font-medium ${
                                yusaSaveStatus.success 
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {yusaSaveStatus.success ? "✅ " : "❌ "}
                                {yusaSaveStatus.message}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-20 py-15">
            {/* 페이지 헤더 (변경 없음) */}
            <div className="flex items-center gap-3.5 mb-8 max-w-[1450px] mx-auto">
                <div className="w-13 h-13 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[14px] flex items-center justify-center shadow-[0_2px_10px_rgba(59,130,246,0.25)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-[26px] font-bold text-slate-800 m-0">AI 사건 분석</h1>
                    <p className="text-sm text-slate-600 mt-1.5 m-0">사건의 사실관계를 입력하여 법률 리스크를 진단하세요.</p>
                </div>
            </div>

            {/* 메인 컨텐츠 (변경 없음) */}
            <div className="grid grid-cols-2 gap-6 max-w-[1450px] mx-auto">
                {/* 왼쪽: 입력 영역 (변경 없음) */}
                <div className="bg-white rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden min-h-[850px] p-7 flex flex-col">
                    <div className="flex items-center gap-2.5 text-[17px] font-semibold text-slate-800 mb-4.5">
                        <span className="text-xl text-blue-500">✏️</span>
                        <span>사실관계 입력</span>
                    </div>

                    <textarea
                        className="w-full flex-1 min-h-[580px] p-4.5 border border-slate-200 rounded-xl text-[15px] leading-relaxed resize-y bg-slate-50 transition-all focus:outline-none focus:border-blue-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                        placeholder="사건의 구체적인 내용을 자유롭게 작성해주세요.&#10;(예: 계약 일시, 당사자, 피해 금액, 현재 상황 등)"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />

                    <div className="flex justify-between items-center mt-3 mb-4">
                        <span className="text-xs text-slate-500">{inputText.length}자 입력됨</span>
                    </div>

                    <button
                        className="relative w-full py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                        onClick={() => {
                            // 🆕 탭에 따라 다른 분석 함수 호출
                            if (activeTab === "similar") {
                                handleYusaAnalyze();
                            } else {
                                handleAnalyze();
                            }
                        }}
                        disabled={isLoading}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                        <span className="relative flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>분석 중...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">✨</span>
                                    <span>분석 시작하기</span>
                                </>
                            )}
                        </span>
                    </button>

                    {statusMessage && (
                        <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${statusMessage.success
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {statusMessage.message}
                        </div>
                    )}
                </div>

                {/* 오른쪽: 결과 영역 */}
                <div className="bg-white rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden min-h-[850px]">
                    {/* 🆕 수정: 탭 목록에 "상세 판례 분석" 탭 추가됨 */}
                    <div className="flex border-b border-slate-200 bg-slate-50">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 bg-white'
                                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="text-base">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="overflow-y-auto max-h-[calc(850px-57px)]">
                        {renderTabContent()}

                        {/* 결과가 있을 때만 저장/복사 버튼 표시 (유사 판례 탭 제외) */}
                        {analysisResult && activeTab !== "similar" && (
                            <div className="flex gap-3 mt-6 mx-6 mb-6 pt-6 border-t border-slate-200">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 text-[15px] font-semibold rounded-xl border border-slate-300 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleCopyResults}
                                    title="결과를 클립보드에 복사"
                                >
                                    📋 결과 복사
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[15px] font-semibold rounded-xl border border-blue-600 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleSaveAnalysis}
                                    title="결과를 데이터베이스에 저장"
                                >
                                    💾 결과 저장
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🆕 YUSA 판례 상세 모달 (Yusa.jsx에서 가져옴) */}
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
