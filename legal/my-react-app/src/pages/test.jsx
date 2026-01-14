import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


export default function Test2() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/test")
      .then((r) => r.text())
      .then(setMsg)
      .catch(() => setMsg("호출 실패"));
  }, []);

  return (
    <div>
      <h2>Test</h2>
      <p>test 화면~</p>
      <a href="/">홈으로</a>
      <br/>
      <Link to="/test2">Test2로 이동하기</Link>
    </div>
  );
}
