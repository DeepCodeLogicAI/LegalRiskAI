import { Routes, Route } from "react-router-dom";
import Yusa from "./pages/yusa.jsx";
import Law from "./pages/law.jsx";
import Jogi from "./pages/jogi.jsx";
import Header from "./component/Header.jsx";
import Footer from "./component/Footer.jsx";
import Boonjang from "./pages/boonjang.jsx";
import Sidebar from "./component/Sidebar.jsx";

export default function App() {
  return (
    // 전체 레이아웃: 세로 플렉스 + 최소 높이 100vh
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ 헤더: 회원정보만 */}
      <Header />


      <div className="flex flex-1">
        {/* 좌측 사이드바 */}
        <Sidebar />

        {/* 우측 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/law" element={<Law />} />
            <Route path="/boonjang" element={<Boonjang />} />
            <Route path="/yusa" element={<Yusa />} />
            <Route path="/jogi" element={<Jogi />} />
          </Routes>
        </main>
      </div>

      {/* ✅ 푸터 */}
      <Footer />
    </div>
  );
}
