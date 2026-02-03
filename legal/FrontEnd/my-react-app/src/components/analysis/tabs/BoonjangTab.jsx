import React, { useState } from "react";
import axios from "axios";

/**
 * 분쟁유형 탭 컴포넌트
 * - 자체 분석 버튼 보유
 * - /classify 또는 /analyze API 호출
 * - 결과를 자체적으로 저장하고 표시
 * - DB 저장 기능 포함
 * 
 * Props:
 *   - inputText: 분석할 텍스트 (부모에서 전달)
 */

const API_BASE = "http://localhost:8000";
const SPRING_API_BASE = "http://localhost:8484";  // Spring Boot 저장 API

export default function DisputeTab({ inputText }) {
    // 이 탭만의 상태
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 저장 관련 상태
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // 분석 실행 함수
    const handleAnalyze = async () => {
        // 입력 검증
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

        try {
            console.log("[분쟁유형 탭] 분석 시작...");

            // /analyze API 호출 (classification 정보 포함)
            const response = await axios.post(`${API_BASE}/analyze`, {
                case_text: inputText
            });

            // classification 부분만 저장
            setResult(response.data.classification);
            console.log("[분쟁유형 탭] 분석 완료:", response.data.classification);

        } catch (err) {
            console.error("[분쟁유형 탭] 분석 오류:", err);
            setError(err.response?.data?.detail || "분석 중 오류가 발생했습니다.");
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
            console.log("[분쟁유형 탭] DB 저장 시작...");

            // Spring Boot API로 저장
            await axios.post(`${SPRING_API_BASE}/api/boonjang/save`, {
                boonjang_input: inputText,
                boonjang_output: JSON.stringify(result),
                boonjang_mark: 0
            });

            setSaved(true);
            console.log("[분쟁유형 탭] DB 저장 완료");

        } catch (err) {
            console.error("[분쟁유형 탭] 저장 오류:", err);
            if (err.response?.status === 401) {
                setSaveError("로그인이 필요한 서비스입니다.");
            } else {
                setSaveError(err.response?.data?.message || "저장 중 오류가 발생했습니다.");
            }
        } finally {
            setSaving(false);
        }
    };

    // =====================
    // 렌더링
    // =====================

    // 1) 로딩 중
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">분쟁 유형 분석 중...</h3>
                <p className="text-sm text-slate-600">AI가 사건 유형을 분류하고 있습니다.</p>
            </div>
        );
    }

    // 2) 에러 발생
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

    // 3) 결과 없음 (분석 전)
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">분쟁 유형 분석</h3>
                <p className="text-slate-600 mb-8">
                    사건의 법적 성격을 규명하고 핵심 쟁점을 도출합니다.
                </p>

                {/* ⭐ 이 탭만의 분석 버튼 */}
                <button
                    onClick={handleAnalyze}
                    className="
            px-8 py-4 
            bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 
            text-white text-base font-semibold rounded-xl 
            transition-all duration-300 
            hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)] 
            hover:scale-105
            active:scale-95
          "
                >
                    ⚖️ 분쟁 유형 분석하기
                </button>
            </div>
        );
    }

    // 4) 결과 표시
    const { inferred_type, confidence, label, llm_analysis } = result;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">📋 분쟁 유형 분석 결과</h3>
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
                        className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    >
                        🔄 다시 분석
                    </button>
                </div>
            </div>

            {/* 저장 에러 메시지 */}
            {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                    ⚠️ {saveError}
                </div>
            )}

            {/* BERT 분류 결과 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-base font-semibold text-slate-800 mb-4">🤖 AI 자동 분류 (BERT)</h4>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">분류:</span>
                    <span className="text-base font-semibold text-blue-600">{inferred_type || "-"}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">레이블:</span>
                    <span className="text-base text-slate-800">{label || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">신뢰도:</span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${(confidence || 0) * 100}%` }}
                            />
                        </div>
                        <span className="text-base text-slate-800">{((confidence || 0) * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {/* LLM 상세 분석 (있을 경우) */}
            {llm_analysis?.available && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">🧠 LLM 상세 분석 (Qwen)</h4>

                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-600">카테고리:</span>
                        <span className="text-base text-slate-800">{llm_analysis.category || "-"}</span>
                    </div>

                    {llm_analysis.reasoning && (
                        <div className="mb-4">
                            <span className="text-sm font-medium text-slate-700 block mb-2">분석 근거:</span>
                            <p className="text-sm text-slate-600 leading-relaxed bg-white/50 p-3 rounded-lg">
                                {llm_analysis.reasoning}
                            </p>
                        </div>
                    )}

                    {llm_analysis.key_points?.length > 0 && (
                        <div>
                            <span className="text-sm font-medium text-slate-700 block mb-2">핵심 쟁점:</span>
                            <ul className="space-y-1.5">
                                {llm_analysis.key_points.map((point, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="text-purple-500 mt-0.5">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {llm_analysis.related_laws?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-200">
                            <span className="text-sm font-medium text-slate-700 block mb-2">관련 법령:</span>
                            <div className="flex flex-wrap gap-2">
                                {llm_analysis.related_laws.map((law, i) => (
                                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                        {law}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
