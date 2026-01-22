/**
 * Zustand 인증 스토어
 * 
 * [원리 설명]
 * Zustand는 "클라이언트 상태"를 관리하는 라이브러리입니다.
 * 
 * 서버 상태 vs 클라이언트 상태:
 * - 서버 상태: API에서 가져온 데이터 → React Query가 관리
 * - 클라이언트 상태: UI 상태, 사용자 정보 → Zustand가 관리
 * 
 * [JSP 로그인 연동]
 * 현재 프로젝트는 Spring Security 세션 기반 인증을 사용합니다.
 * 
 * 흐름:
 * 1. 사용자가 JSP 로그인 페이지(/login)에서 로그인
 * 2. Spring Security가 세션 생성 → JSESSIONID 쿠키 발급
 * 3. 브라우저가 쿠키 자동 저장
 * 4. React 앱에서 fetch 시 credentials: 'include' 설정
 * 5. 브라우저가 쿠키 자동 전송 → 인증된 요청
 * 
 * 따라서 React에서는:
 * - JWT 토큰을 직접 관리할 필요 없음
 * - 로그인/로그아웃은 JSP 페이지에서 처리
 * - 현재 사용자 정보만 저장하면 됨
 */

import { create } from 'zustand';

/**
 * 인증 상태 스토어
 * 
 * [사용법]
 * // 컴포넌트에서
 * const { user, isLoggedIn, setUser, clearUser } = useAuthStore();
 * 
 * // 사용자 정보 설정 (로그인 확인 API 호출 후)
 * setUser({ username: 'test01', role: 'USER' });
 * 
 * // 로그아웃 시
 * clearUser();
 */
const useAuthStore = create((set) => ({
    // 상태
    user: null,           // 현재 로그인한 사용자 정보
    isLoggedIn: false,    // 로그인 여부

    // 액션
    setUser: (user) => set({
        user,
        isLoggedIn: true
    }),

    clearUser: () => set({
        user: null,
        isLoggedIn: false
    }),

    /**
     * 현재 로그인 상태 확인
     * 
     * [원리]
     * 페이지 로드 시 백엔드에 현재 세션의 사용자 정보 요청
     * Spring Security가 세션에서 인증 정보 확인 후 반환
     */
    checkAuth: async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (response.ok) {
                const user = await response.json();
                set({ user, isLoggedIn: true });
            } else {
                set({ user: null, isLoggedIn: false });
            }
        } catch (error) {
            console.error('인증 확인 실패:', error);
            set({ user: null, isLoggedIn: false });
        }
    },
}));

export default useAuthStore;
