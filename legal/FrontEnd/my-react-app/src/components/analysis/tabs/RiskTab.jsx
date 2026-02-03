import React, { useState } from "react";
import axios from "axios";

/**
 * 리스크 탭 컴포넌트
 * - 자체 분석 버튼 보유
 * - /risk-analyze API 호출
 * - 승소율, 위험도, 형량, 벌금 표시
 * - DB 저장 기능 포함
 * 
 * Props:
 *   - inputText: 분석할 텍스트 (부모에서 전달)
 */

const API_BASE = "http://localhost:8000";
const SPRING_API_BASE = "http://localhost:8484";  // Spring Boot 저장 API

export default function RiskTab({ inputText }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            console.log("[리스크 탭] 분석 시작...");

            const response = await axios.post(`${API_BASE}/risk-analyze`, {
                case_text: inputText
            });

            setResult(response.data);
            console.log("[리스크 탭] 분석 완료:", response.data);

        } catch (err) {
            console.error("[리스크 탭] 분석 오류:", err);
            setError(err.response?.data?.detail || "위험도 분석 중 오류가 발생했습니다.");
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
            console.log("[리스크 탭] DB 저장 시작...");

            // Spring Boot API로 저장
            await axios.post(`${SPRING_API_BASE}/api/law/save`, {
                law_input: inputText,
                law_output: JSON.stringify(result),
                law_mark: 0
            });

            setSaved(true);
            console.log("[리스크 탭] DB 저장 완료");

        } catch (err) {
            console.error("[리스크 탭] 저장 오류:", err);
            if (err.response?.status === 401) {
                setSaveError("로그인이 필요한 서비스입니다.");
            } else {
                setSaveError(err.response?.data?.message || "저장 중 오류가 발생했습니다.");
            }
        } finally {
            setSaving(false);
        }
    };

    // 위험도에 따른 색상
    const getRiskColor = (riskScore) => {
        if (riskScore >= 70) return { bg: "bg-red-500", text: "text-red-600" };
        if (riskScore >= 40) return { bg: "bg-amber-500", text: "text-amber-600" };
        return { bg: "bg-green-500", text: "text-green-600" };
    };

    // 승소율에 따른 색상
    const getWinRateColor = (winRate) => {
        if (winRate >= 70) return "text-green-600";
        if (winRate >= 40) return "text-amber-600";
        return "text-red-600";
    };

    // =====================
    // 렌더링
    // =====================

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">법적 리스크 분석 중...</h3>
                <p className="text-sm text-slate-600">AI가 위험도를 예측하고 있습니다.</p>
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
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">법적 리스크 분석</h3>
                <p className="text-slate-600 mb-8">
                    예상 승소율, 위험도, 형량, 벌금 등을 AI로 예측합니다.
                </p>

                <button
                    onClick={handleAnalyze}
                    className="
            px-8 py-4 
            bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 
            text-white text-base font-semibold rounded-xl 
            transition-all duration-300 
            hover:shadow-[0_8px_30px_rgba(245,158,11,0.4)] 
            hover:scale-105
            active:scale-95
          "
                >
                    ⚠️ 리스크 분석하기
                </button>
            </div>
        );
    }

    // 결과가 실패인 경우
    if (!result.success) {
        return (
            <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <span className="text-4xl mb-4 block">⚠️</span>
                    <p className="text-amber-700 font-medium">위험도 분석 서비스를 사용할 수 없습니다.</p>
                    <p className="text-amber-600 text-sm mt-2">{result.error || result.detail}</p>
                </div>
            </div>
        );
    }

    // 결과 표시
    const { win_rate, risk, sentence, fine, feedback } = result;
    const riskColor = getRiskColor(risk || 0);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">⚠️ 법적 리스크 분석 결과</h3>
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
                        className="px-4 py-2 text-sm bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"
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

            {/* 승소율 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-base font-semibold text-slate-800 mb-4">📊 예상 승소율</h4>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-600">승소 가능성:</span>
                    <span className={`text-2xl font-bold ${getWinRateColor(win_rate || 0)}`}>
                        {(win_rate || 0).toFixed(1)}%
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${(win_rate || 0) >= 70 ? "bg-green-500" :
                            (win_rate || 0) >= 40 ? "bg-amber-500" : "bg-red-500"
                            }`}
                        style={{ width: `${win_rate || 0}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">유사 판례 분석 기반 예측</p>
            </div>

            {/* 위험도 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                <h4 className="text-base font-semibold text-slate-800 mb-4">⚠️ 위험도 평가</h4>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-600">위험도 점수:</span>
                    <span className={`text-2xl font-bold ${riskColor.text}`}>
                        {(risk || 0).toFixed(0)}/100
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${riskColor.bg}`}
                        style={{ width: `${risk || 0}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">높을수록 주의가 필요합니다</p>
            </div>

            {/* 형량 (0.1년 이상일 때만) */}
            {sentence > 0.1 && (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">⚖️ 예상 형량</h4>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-600">형량:</span>
                        <span className="text-2xl font-bold text-red-600">
                            {(sentence || 0).toFixed(1)}년
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">유사 사건 판례 기반 예측</p>
                </div>
            )}

            {/* 벌금 (1만원 이상일 때만) */}
            {fine > 10000 && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">💰 예상 벌금</h4>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-slate-600">벌금액:</span>
                        <span className="text-2xl font-bold text-violet-600">
                            {(fine || 0).toLocaleString()}원
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">유사 사건 판례 기반 예측</p>
                </div>
            )}

            {/* Gemini 피드백 (있을 경우) */}
            {feedback && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-4">🤖 AI 피드백 (Gemini)</h4>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {feedback}
                    </div>
                </div>
            )}
        </div>
    );
}
