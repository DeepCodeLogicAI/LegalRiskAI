/**
 * 공통 푸터 컴포넌트
 * 
 * [디자인]
 * - 깔끔한 화이트 배경
 * - 미니멀한 스타일
 * - GitHub 링크 포함
 */

import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* 로고 & 저작권 */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚖️</span>
                        <span className="text-sm text-gray-600">
                            © {currentYear} LegalRisk AI
                        </span>
                    </div>

                    {/* 링크 */}
                    <nav className="flex items-center gap-6 text-sm text-gray-500">
                        <Link to="/boonjang" className="hover:text-gray-900 transition">분쟁유형</Link>
                        <Link to="/law" className="hover:text-gray-900 transition">법적위험</Link>
                        <Link to="/yusa" className="hover:text-gray-900 transition">유사판례</Link>
                        <Link to="/jogi" className="hover:text-gray-900 transition">조기위험</Link>
                    </nav>

                    {/* 연락처 및 GitHub */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>문의: support@legalrisk.ai</span>
                        <a
                            href="https://github.com/DeepCodeLogicAI/LegalRiskAI.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-gray-900 transition"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                        </a>
                    </div>
                </div>

                {/* 면책조항 */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        본 서비스는 법률 정보 제공 목적으로만 사용되며, 전문적인 법률 자문을 대체하지 않습니다.
                    </p>
                </div>
            </div>
        </footer>
    );
}
