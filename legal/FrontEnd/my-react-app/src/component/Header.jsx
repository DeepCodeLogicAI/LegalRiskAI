import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

/**
 * Tailwind CSS 헤더
 * - 레이어 아이콘 + LegalRiskAI 로고
 * - 중앙 탭 네비게이션
 * - 모바일 햄버거 메뉴
 */
export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    axios
      .get("/api/user/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
    } catch (e) {
      try {
        await axios.get("/logout", { withCredentials: true });
      } catch (e2) { }
    } finally {
      window.location.href = "/";
    }
  };

  // 현재 AI 분석 페이지인지 확인
  const isAnalysisPage = ["/boonjang", "/law", "/yusa", "/jogi", "/ai-analysis"].some(
    path => location.pathname.startsWith(path)
  );

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-150">
      <div className="relative w-full max-w-[1600px] mx-auto px-20 h-18 flex items-center justify-between">
        {/* 왼쪽: 로고 */}
        <a href="/" className="flex-shrink-0 flex items-center gap-2.5 no-underline transition-opacity hover:opacity-90">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
            {/* 레이어 아이콘 */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="4" rx="1" fill="white" />
              <rect x="3" y="10" width="18" height="4" rx="1" fill="white" opacity="0.7" />
              <rect x="3" y="17" width="18" height="4" rx="1" fill="white" opacity="0.4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-slate-800">
            LegalRisk<span className="text-blue-500">AI</span>
          </span>
        </a>

        {/* 중앙: 메인 네비게이션 (데스크탑) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <NavLink
            to="/ai-analysis"
            className={({ isActive }) => `flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive || isAnalysisPage
              ? 'bg-white text-blue-500 shadow-sm'
              : 'text-slate-500 hover:bg-white/70 hover:text-blue-500'
              }`}
          >
            <span className="text-base">📋</span>
            <span>법률 종합 검과</span>
          </NavLink>

          <a
            href="/mypage/main"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-500 rounded-lg transition-all hover:bg-white/70 hover:text-blue-500"
          >
            <span className="text-base">👤</span>
            <span>마이페이지</span>
          </a>
        </nav>

        {/* 오른쪽: 사용자 영역 (데스크탑) */}
        <div className="hidden md:block relative flex-shrink-0" ref={menuRef}>
          {loading ? (
            <span className="text-sm text-slate-400">로딩중...</span>
          ) : user ? (
            <>
              <button
                type="button"
                onClick={() => setShowUserMenu((v) => !v)}
                className="px-4 py-2 "
              >
                <span>👋 {user.displayName || user.username} 님</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-slate-800">{user.displayName || user.username} 님</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user.username}</p>
                  </div>

                  <a
                    href="/mypage/main"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors no-underline"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span>👤</span>
                    <span>마이페이지</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-0 bg-transparent text-left"
                  >
                    <span>🚪</span>
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors no-underline">
                로그인
              </a>
              <a href="/client/join" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all no-underline">
                회원가입
              </a>
            </div>
          )}
        </div>

        {/* 모바일: 햄버거 메뉴 버튼 */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-slate-800 border-0 bg-transparent"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-2">
            <NavLink
              to="/ai-analysis"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors no-underline ${isActive || isAnalysisPage
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span>📋</span>
              <span>법률 종합 검과</span>
            </NavLink>

            <a
              href="/mypage/main"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors no-underline"
              onClick={() => setShowMobileMenu(false)}
            >
              <span>👤</span>
              <span>마이페이지</span>
            </a>

            <div className="h-px bg-gray-200 my-2"></div>

            {user ? (
              <>
                <div className="px-4 py-3">
                  <span className="block text-xs font-semibold text-blue-600 mb-1">Premium Plan</span>
                  <span className="block text-sm font-medium text-slate-800">{user.displayName || user.username} 님</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-0 bg-transparent text-left"
                >
                  <span>🚪</span>
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors no-underline"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span>🔑</span>
                  <span>로그인</span>
                </a>
                <a
                  href="/client/join"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors no-underline"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span>✨</span>
                  <span>회원가입</span>
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function LoginRequired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">로그인이 필요합니다</h2>
        <p className="text-slate-600 mb-6">
          이 서비스는 로그인 후 이용 가능합니다.<br />로그인하여 LegalRisk AI의 모든 기능을 사용해보세요.
        </p>
        <div className="flex gap-3">
          <a
            href="/login"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all no-underline"
          >
            로그인하기
          </a>
          <a
            href="/client/join"
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-all no-underline"
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
