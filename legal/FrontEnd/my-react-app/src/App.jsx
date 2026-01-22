/**
 * 메인 앱 컴포넌트
 * 
 * [구조]
 * - Header: 공통 헤더 (네비게이션)
 * - Routes: 페이지 라우팅
 * - Footer: 공통 푸터
 */
import { Routes, Route, Navigate } from "react-router-dom";
import Yusa from "./pages/yusa.jsx";
import Law from "./pages/law.jsx";
import Jogi from "./pages/jogi.jsx";
import Boonjang from "./pages/boonjang.jsx";
import Header from "../component/header.jsx";
import Footer from "../component/footer.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 공통 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <Routes>
          {/* 루트 경로 - 분쟁 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/boonjang" replace />} />
          <Route path="/law" element={<Law />} />
          <Route path="/boonjang" element={<Boonjang />} />
          <Route path="/yusa" element={<Yusa />} />
          <Route path="/jogi" element={<Jogi />} />
          {/* 404 처리 */}
          <Route path="*" element={
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="text-gray-500 mt-4 text-lg">페이지를 찾을 수 없습니다</p>
                <a href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  홈으로 돌아가기
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>

      {/* 공통 푸터 */}
      <Footer />
    </div>
  );
}
