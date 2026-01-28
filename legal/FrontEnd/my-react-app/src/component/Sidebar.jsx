import { NavLink, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";

/**
 * ✅ 사이드바 메뉴 구조
 * - 법률 상담 받기(상위) 클릭 → 하위 4개 펼침
 *   [분쟁유형] [법적위험] [유사판례] [조기위험]
 * - 최근결과
 * - 마이페이지
 */

const consultSubItems = [
  { to: "/boonjang", label: "분쟁유형", icon: "⚖️" },
  { to: "/law", label: "법적위험", icon: "⚠️" },
  { to: "/yusa", label: "유사판례", icon: "🔍" },
  { to: "/jogi", label: "조기위험", icon: "💡" },
];

const mainItems = [
  { to: "/recent", label: "최근 결과", icon: "🕘" },
  { to: "/mypage/main", label: "마이페이지", icon: "👤" },
];

export default function Sidebar() {
  const location = useLocation();

  // ✅ 현재 위치가 하위 4개 중 하나인지 확인 (선택 강조/기본 펼침용)
  const isInConsultSection = useMemo(() => {
    const current = location.pathname;
    return consultSubItems.some((i) => current === i.to || current.startsWith(i.to + "/"));
  }, [location.pathname]);

  // ✅ 펼침 상태: 현재 상담 섹션이면 기본 펼침
  const [openConsult, setOpenConsult] = useState(isInConsultSection);

  // 라우트가 바뀌었는데 상담 섹션으로 들어오면 자동으로 펼쳐주기
  useEffect(() => {
    if (isInConsultSection) setOpenConsult(true);
  }, [isInConsultSection]);

  // (선택) 바깥 클릭 시 닫고 싶으면 사용 — 사이드바는 보통 필요 없어서 유지/삭제 자유
  const boxRef = useRef(null);

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <div className="p-5">
        <div className="text-lg font-semibold text-gray-900">메뉴</div>
        <p className="text-sm text-gray-400 mt-1">LegalRisk AI</p>
      </div>

      <nav className="px-3 pb-6" ref={boxRef}>
        {/* ✅ 법률 상담 받기 (상위) */}
        <button
          type="button"
          onClick={() => setOpenConsult((v) => !v)}
          className={[
            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl",
            "transition-colors",
            isInConsultSection
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "text-gray-700 hover:bg-gray-50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">💬</span>
            <span>법률 상담 받기</span>
          </div>

          <svg
            className={["w-4 h-4 transition-transform", openConsult ? "rotate-180" : ""].join(" ")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* ✅ 하위 4개 메뉴 */}
        {openConsult && (
          <div className="mt-2 ml-2 pl-2 border-l border-gray-100">
            {consultSubItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                    "transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {/* ✅ 기타 단독 메뉴 */}
        <div className="mt-4">
          {mainItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  "transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
