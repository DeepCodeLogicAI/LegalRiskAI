/**
 * React 앱 진입점
 * 
 * [변경 사항]
 * - QueryClientProvider 추가: React Query 활성화
 * 
 * [원리]
 * QueryClientProvider는 React Query의 "클라이언트"를 모든 하위 컴포넌트에 제공합니다.
 * 이를 통해 어떤 컴포넌트에서든 useQuery, useMutation을 사용할 수 있습니다.
 */
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import './index.css';

// React Query 클라이언트 생성
// defaultOptions: 전역 기본 설정 (에러 시 재시도 횟수 등)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,  // 실패 시 1번 재시도
      refetchOnWindowFocus: false,  // 창 포커스 시 자동 리페치 비활성화
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);
