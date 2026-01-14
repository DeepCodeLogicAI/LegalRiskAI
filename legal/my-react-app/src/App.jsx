import { Routes, Route, Link } from "react-router-dom";
import Test from "./pages/test.jsx";
import Test2 from "./pages/test2.jsx";

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/test">Test</Link>
        <Link to="/test2">Test2</Link>
      </nav>

      <Routes>
        <Route path="/test" element={<Test />} />
        <Route path="/test2" element={<Test2 />} />
      </Routes>
    </div>
  );
}
