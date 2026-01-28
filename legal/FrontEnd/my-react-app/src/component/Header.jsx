import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 사용자 드롭다운
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // ✅ 현재 로그인 유저 조회
  useEffect(() => {
    axios
      .get("/api/user/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ✅ 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
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
      <div className="w-full px-6">
        {/* 좌: 로고 / 우: 회원정보 */}
        <div className="flex h-16 items-center justify-between">
          {/* ✅ 로고 */}
          <a href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-xl text-white">⚖️</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 tracking-tight">
              LegalRisk <span className="text-blue-600">AI</span>
            </span>
          </a>

          {/* ✅ 회원정보 영역 */}
          <div className="relative flex items-center gap-2" ref={userMenuRef}>
            {loading ? (
              <span className="text-gray-400 text-sm">로딩중...</span>
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                >
                  <span className="text-gray-700 font-medium">
                    👋 {user.displayName} 님
                  </span>
                  <svg
                    className={[
                      "w-4 h-4 text-gray-400 transition-transform",
                      showUserMenu ? "rotate-180" : "",
                    ].join(" ")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">
                        {user.displayName || user.username} 님
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.username}
                      </p>
                    </div>

                    <a
                      href="/mypage/main"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">마이페이지</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
