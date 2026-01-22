/**
 * 분쟁 유형 분류 페이지
 * 
 * [구조]
 * ┌────────────────────────────────────────────────────────┐
 * │                    분쟁 유형 분류 AI                      │
 * ├──────────────────────┬─────────────────────────────────┤
 * │   분쟁 내용 입력        │         분석 결과                │
 * │   (textarea)         │    - 분류 유형 (민사/소비자)        │
 * │                      │    - 요약                        │
 * │   [샘플 텍스트 입력]    │    - 키워드 태그                  │
 * │   [유형 분석 실행]      │    - 법률적 판단                  │
 * │                      │    - 관련 법령                    │
 * └──────────────────────┴─────────────────────────────────┘
 * 
 * [React Query 사용]
 * - useBoonjangMutation: POST /api/boonjang 호출
 * - 자동 로딩/에러 상태 관리
 * 
 * [DB 저장 흐름]
 * 1. 사용자가 분쟁 내용 입력
 * 2. "유형 분석 실행" 버튼 클릭
 * 3. POST /api/boonjang 호출 (boonjangInput 전송)
 * 4. 백엔드가 DB에 저장 (BOONJANG 테이블)
 * 5. 분석 결과 반환 → 오른쪽 패널에 표시
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useBoonjangMutation } from "../api/queries";

export default function Boonjang() {
  // 입력 상태
  const [inputText, setInputText] = useState("");

  // React Query mutation (POST 요청)
  const mutation = useBoonjangMutation();

  // 샘플 텍스트 입력
  const handleSampleText = () => {
    setInputText(`안녕하세요, 저는 온라인 쇼핑몰에서 전자제품을 구매했습니다.
제품 수령 후 3일 만에 청약철회를 요청했으나, 판매자가 개봉제품이라는 이유로 환불을 거부하고 있습니다.
전자상거래법에 따르면 7일 이내 청약철회가 가능한 것으로 알고 있는데, 판매자는 자체 규정을 근거로 반품 불가를 주장합니다.
이로 인해 50만원의 손해가 발생했으며, 부당한 청구라고 생각합니다.
소비자보호원에 신고할 예정이며, 필요시 법적 조치도 고려하고 있습니다.`);
  };

  // 분석 실행
  const handleAnalyze = () => {
    if (!inputText.trim()) {
      alert("분쟁 내용을 입력해주세요.");
      return;
    }

    // mutation.mutate()를 호출하면 POST 요청이 실행됨
    mutation.mutate({
      boonjangInput: inputText,
    });
  };

  return (
    <div className="bg-gray-50">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">📋</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">분쟁 유형 분류 AI</h1>
            <p className="text-sm text-gray-500">
              분쟁 텍스트를 분석하여 Consumer, Contract, Administrative 등 유형을 자동 분류합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 왼쪽: 입력 패널 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📝 분쟁 내용 입력
            </h2>

            <textarea
              className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="분쟁 상황을 상세히 입력해주세요..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>{inputText.length}자</span>
              <button
                onClick={handleSampleText}
                className="text-blue-500 hover:underline"
              >
                샘플 텍스트 입력
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={mutation.isPending}
              className="w-full mt-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <span className="animate-spin">⏳</span>
                  분석 중...
                </>
              ) : (
                <>
                  ⚡ 유형 분석 실행
                </>
              )}
            </button>
          </div>

          {/* 오른쪽: 결과 패널 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📊 분석 결과
            </h2>

            {/* 에러 표시 */}
            {mutation.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 font-medium">오류 발생</p>
                <p className="text-red-500 text-sm mt-1">{mutation.error.message}</p>
              </div>
            )}

            {/* 결과가 없을 때 */}
            {!mutation.data && !mutation.isPending && !mutation.error && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">📋</p>
                <p>왼쪽에서 분쟁 내용을 입력하고</p>
                <p>"유형 분석 실행" 버튼을 클릭하세요.</p>
              </div>
            )}

            {/* 로딩 중 */}
            {mutation.isPending && (
              <div className="text-center py-12">
                <div className="animate-pulse">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="text-gray-500">분석 중입니다...</p>
                </div>
              </div>
            )}

            {/* 결과 표시 */}
            {mutation.data && (
              <div className="space-y-6">
                {/* 분류 유형 */}
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {mutation.data.classification || "민사"}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {mutation.data.subType || "소비자"}
                  </span>
                </div>

                {/* 요약 */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {mutation.data.summary || "온라인 쇼핑몰에서 구매한 전자제품을 7일 이내에 환불 요청했으나 판매자가 개봉을 이유로 거부하고 있는 상황입니다."}
                  </h3>
                </div>

                {/* 키워드 태그 */}
                <div className="flex flex-wrap gap-2">
                  {(mutation.data.keywords || ["#청약철회", "#전자상거래", "#환불거부"]).map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* 법률적 판단 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    ⚖️ 법률적 판단
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {mutation.data.judgment || "온라인 쇼핑몰에서 구매한 전자제품을 7일 이내에 환불 요청했으나 판매자가 개봉을 이유로 거부하고 있는 상황입니다. 이는 전자상거래법상 보장되는 청약철회권과 판매자의 자체 규정이 충돌하는 분쟁입니다."}
                  </p>
                </div>

                {/* 관련 법령 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    📚 관련 법령
                  </h4>
                  <ul className="space-y-2">
                    {(mutation.data.relatedLaws || [
                      "전자상거래 등에서의 소비자보호에 관한 법률",
                      "소비자기본법"
                    ]).map((law, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <span className="w-1 h-6 bg-blue-500 rounded"></span>
                        {law}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
