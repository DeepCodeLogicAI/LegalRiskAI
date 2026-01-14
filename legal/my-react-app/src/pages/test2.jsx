import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


export default function Test2() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/test2")
      .then((r) => r.text())
      .then(setMsg)
      .catch(() => setMsg("호출 실패"));
  }, []);

  return (
    <div>
      <h2>Test2</h2>
      <p>/test2 화면~</p>
      <a href="/">홈으로</a>
      <br/>
      <Link to="/test">Test로 이동하기</Link>
    </div>
  );
}
