/**
 * 공통 헤더 컴포넌트
 * 
 * [디자인]
 * - 깔끔한 화이트 배경
 * - 미니멀한 스타일
 */

import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">

                    {/* 로고 */}
                    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition">
                        <span className="text-2xl">⚖️</span>
                        <span className="text-xl font-bold text-gray-900">LegalRisk AI</span>
                    </a>

                    {/* 네비게이션 */}
                    <nav className="flex items-center gap-8">
                        <Link
                            to="/boonjang"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                        >
                            분쟁유형
                        </Link>
                        <Link
                            to="/law"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                        >
                            법적위험
                        </Link>
                        <Link
                            to="/yusa"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                        >
                            유사판례
                        </Link>
                        <Link
                            to="/jogi"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                        >
                            조기위험
                        </Link>
                    </nav>

                    {/* 로그인/회원가입 버튼 */}
                    <div className="flex items-center gap-3">
                        <a
                            href="/login"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                        >
                            로그인
                        </a>
                        <a
                            href="/client/join"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            회원가입
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
