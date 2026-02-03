import React, { useState } from "react";
import axios from "axios";

/**
 * 유사 판례 탭 컴포넌트
 * - 자체 분석 버튼 보유
 * - /analyze API 호출 후 similar_cases만 사용
 * - 유사도 높은 판례 목록 표시
 * - DB 저장 기능 포함
 * 
 * Props:
 *   - inputText: 분석할 텍스트 (부모에서 전달)
 */

const API_BASE = "http://localhost:8000";
const SPRING_API_BASE = "http://localhost:8484";  // Spring Boot 저장 API

export default function SimilarTab({ inputText }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);  // 상세보기용

    // 저장 관련 상태
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const handleAnalyze = async () => {
        if (!inputText || !inputText.trim()) {
            setError("사건 내용을 먼저 입력해주세요.");
            return;
        }

        if (inputText.trim().length < 50) {
            setError("최소 50자 이상 입력해주세요.");
            return;
        }

        setLoading(true);
        setError(null);
        setSaved(false);  // 다시 분석하면 저장 상태 초기화

        try {
            console.log("[유사판례 탭] 분석 시작...");

            const response = await axios.post(`${API_BASE}/analyze`, {
                case_text: inputText
            });

            // similar_cases 부분만 저장
            setResult(response.data.similar_cases || []);
            console.log("[유사판례 탭] 분석 완료:", response.data.similar_cases);

        } catch (err) {
            console.error("[유사판례 탭] 분석 오류:", err);
            setError(err.response?.data?.detail || "유사 판례 검색 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // DB 저장 함수
    const handleSave = async () => {
        if (!result) return;

        setSaving(true);
        setSaveError(null);

        try {
            console.log("[유사판례 탭] DB 저장 시작...");

            // Spring Boot API로 저장
            await axios.post(`${SPRING_API_BASE}/api/yusa/save`, {
                yusa_input: inputText,
                yusa_output: JSON.stringify(result),
                yusa_mark: 0
            });

            setSaved(true);
            console.log("[유사판례 탭] DB 저장 완료");

        } catch (err) {
            console.error("[유사판례 탭] 저장 오류:", err);
            if (err.response?.status === 401) {
                setSaveError("로그인이 필요한 서비스입니다.");
            } else {
                setSaveError(err.response?.data?.message || "저장 중 오류가 발생했습니다.");
            }
        } finally {
            setSaving(false);
        }
    };

    // 상세 판례 조회
    const handleViewCase = async (caseItem) => {
        const caseId = caseItem.case_id || caseItem.case_number;
        if (!caseId) {
            setSelectedCase(caseItem);  // ID 없으면 기본 정보만 표시
            return;
        }

        try {
            const response = await axios.get(`${API_BASE}/case/${caseId}/full`);
            setSelectedCase(response.data);
        } catch (err) {
            console.error("판례 상세 조회 실패:", err);
            setSelectedCase(caseItem);  // 실패하면 기본 정보만 표시
        }
    };

    // 유사도에 따른 색상
    const getSimilarityColor = (similarity) => {
        if (similarity >= 0.8) return "bg-green-500";
        if (similarity >= 0.6) return "bg-blue-500";
        return "bg-amber-500";
    };

    // =====================
    // 렌더링
    // =====================

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">유사 판례 검색 중...</h3>
                <p className="text-sm text-slate-600">AI가 관련 판례를 찾고 있습니다.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <span className="text-4xl mb-4 block">❌</span>
                    <p className="text-red-600 font-medium">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">유사 판례 검색</h3>
                <p className="text-slate-600 mb-8">
                    입력한 사건과 유사한 실제 판례를 AI가 찾아드립니다.
                </p>

                <button
                    onClick={handleAnalyze}
                    className="
            px-8 py-4 
            bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
            text-white text-base font-semibold rounded-xl 
            transition-all duration-300 
            hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] 
            hover:scale-105
            active:scale-95
          "
                >
                    🔍 유사 판례 검색하기
                </button>
            </div>
        );
    }

    // 결과 표시
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                    📚 유사 판례 {result.length}건
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className={`
                            px-4 py-2 text-sm rounded-lg transition flex items-center gap-1
                            ${saved
                                ? "bg-green-100 text-green-700"
                                : saving
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }
                        `}
                    >
                        {saved ? "✅ 저장됨" : saving ? "⏳ 저장 중..." : "💾 저장"}
                    </button>
                    <button
                        onClick={handleAnalyze}
                        className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                    >
                        🔄 다시 검색
                    </button>
                </div>
            </div>

            {/* 저장 에러 메시지 */}
            {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                    ⚠️ {saveError}
                </div>
            )}

            {result.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-slate-600">유사한 판례를 찾지 못했습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {result.map((caseItem, index) => (
                        <div
                            key={caseItem.case_id || index}
                            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 transition cursor-pointer"
                            onClick={() => handleViewCase(caseItem)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="text-base font-semibold text-slate-800 mb-1">
                                        {caseItem.case_name || "판례 정보"}
                                    </h4>
                                    <div className="text-sm text-slate-500">
                                        {caseItem.court} | {caseItem.case_number}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-12 h-2 rounded-full ${getSimilarityColor(caseItem.similarity)}`}
                                    />
                                    <span className="text-sm font-medium text-slate-700">
                                        {((caseItem.similarity || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {caseItem.case_type}
                                </span>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                    {caseItem.decision_type}
                                </span>
                                <span className={`px-2.5 py-1 text-xs rounded-full ${caseItem.decision_result?.includes("승소") || caseItem.decision_result?.includes("인용")
                                    ? "bg-green-100 text-green-700"
                                    : caseItem.decision_result?.includes("패소") || caseItem.decision_result?.includes("기각")
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {caseItem.decision_result}
                                </span>
                            </div>

                            {caseItem.xai_reason && (
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                    💡 {caseItem.xai_reason}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 상세보기 모달 */}
            {selectedCase && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedCase(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">
                                {selectedCase.case_name || "판례 상세"}
                            </h3>
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="text-slate-400 hover:text-slate-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">법원:</span>
                                <span className="text-slate-800">{selectedCase.court || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">사건번호:</span>
                                <span className="text-slate-800">{selectedCase.case_number || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">사건유형:</span>
                                <span className="text-slate-800">{selectedCase.case_type || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">판결유형:</span>
                                <span className="text-slate-800">{selectedCase.decision_type || "-"}</span>
                            </div>

                            {selectedCase.full_text && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-slate-700 mb-2">판결문:</h4>
                                    <div className="bg-slate-50 p-4 rounded-lg text-slate-600 leading-relaxed max-h-72 overflow-y-auto">
                                        {selectedCase.full_text}
                                    </div>
                                </div>
                            )}

                            {selectedCase.summary && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-slate-700 mb-2">요약:</h4>
                                    <p className="text-slate-600 bg-blue-50 p-4 rounded-lg">
                                        {selectedCase.summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
