import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";



// 1차 메뉴(상단)
const topNavItems = [
  { to: "/results/recent", label: "최근 결과", icon: "🕒" },
];

// 2차 메뉴(사건 보기 하위)
const caseSubItems = [
  { to: "/boonjang", label: "분쟁유형", icon: "⚖️" },
  { to: "/law", label: "법적위험", icon: "⚠️" },
  { to: "/yusa", label: "유사판례", icon: "🔍" },
  { to: "/jogi", label: "조기위험", icon: "💡" },
];

export default function Header() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 사용자 드롭다운
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // ✅ 사건 보기 하위 메뉴
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const caseMenuRef = useRef(null);

  // ✅ 현재 페이지가 사건 보기(하위 4개) 중 하나인지 표시용
  const isInCaseSection = useMemo(() => {
    const current = location.pathname;
    return caseSubItems.some((i) => current === i.to || current.startsWith(i.to + "/"));
  }, [location.pathname]);

  useEffect(() => {
    axios
      .get("/api/user/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ✅ 바깥 클릭 시 메뉴 닫기(사용자/사건보기 둘 다)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 사용자 메뉴
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      // 사건 보기 메뉴
      if (caseMenuRef.current && !caseMenuRef.current.contains(event.target)) {
        setShowCaseMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
    } catch (e) {
      try {
        await axios.get("/logout", { withCredentials: true });
      } catch (e2) {}
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center gap-8">
          {/* 로고 */}
          <a href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-xl text-white">⚖️</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              LegalRisk <span className="text-blue-600">AI</span>
            </span>
          </a>

          {/* ✅ 네비게이션 */}
          <nav className="flex-1 flex items-center gap-2 ml-6">
            {/* 1) 사건 보기 (클릭 시 하위 메뉴 펼침) */}
            <div className="relative" ref={caseMenuRef}>
              <button
                type="button"
                onClick={() => setShowCaseMenu((v) => !v)}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm md:text-base",
                  "transition-colors",
                  isInCaseSection
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
              >
                <span className="text-lg">⚖️</span>
                <span>법률 종합 결과</span>
                <svg
                  className={[
                    "w-4 h-4 transition-transform",
                    showCaseMenu ? "rotate-180" : "",
                  ].join(" ")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 하위 메뉴 (4개) */}
              {showCaseMenu && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-white shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 text-xs text-gray-400">
                    사건을 4가지 관점으로 확인합니다
                  </div>

                  <div className="px-2">
                    {caseSubItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowCaseMenu(false)}
                        className={({ isActive }) =>
                          [
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg",
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
                </div>
              )}
            </div>

            {/* 2) 최근 결과 (상단 단독 메뉴) */}
            {topNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm md:text-base",
                    "transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  ].join(" ")
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* ========== 사용자 영역 ========== */}
          <div className="relative flex items-center gap-2" ref={userMenuRef}>
            {loading ? (
              <span className="text-gray-400 text-sm">로딩중...</span>
            ) : user ? (
              <>
                <button type="button" onClick={() => setShowUserMenu((v) => !v)}>
                  <span className="text-gray-700 font-medium px-2">
                    👋 {user.displayName} 님
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">
                        {user.displayName || user.username} 님
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.username}</p>
                    </div>

                    <a
                      href="/mypage/main"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                      <span className="text-gray-700">마이페이지</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                        />
                      </svg>
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-3 py-2 text-xs md:text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  로그인
                </a>
                <a
                  href="/client/join"
                  className="px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 active:scale-[0.98] transition"
                >
                  회원가입
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * ========================================
 * 비로그인 안내 컴포넌트 (LoginRequired)
 * ========================================
 */
export function LoginRequired() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-500 mb-6">
          이 서비스는 로그인 후 이용 가능합니다.
          <br />
          로그인하여 LegalRisk AI의 모든 기능을 사용해보세요.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/login"
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-center"
          >
            로그인하기
          </a>
          <a
            href="/client/join"
            className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
