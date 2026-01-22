/**
 * React Query 커스텀 훅
 * 
 * [원리 설명]
 * React Query는 "서버 상태"를 관리하는 라이브러리입니다.
 * 
 * 1. useQuery: 데이터 조회 (GET)
 *    - 자동으로 로딩 상태 관리 (isLoading)
 *    - 자동으로 에러 상태 관리 (error)
 *    - 자동으로 캐싱 (같은 요청 시 캐시 사용)
 *    - 자동으로 백그라운드 리페치 (탭 전환 시)
 * 
 * 2. useMutation: 데이터 변경 (POST, PUT, DELETE)
 *    - 로딩 상태 관리 (isPending)
 *    - 에러 처리
 *    - 성공 시 캐시 무효화 (다시 조회)
 * 
 * [왜 필요한가?]
 * 기존 코드:
 *   const [msg, setMsg] = useState("");
 *   useEffect(() => { fetch(...).then(...) }, []);
 * 
 * 문제점:
 *   - 로딩 상태 없음
 *   - 에러 상세 정보 없음
 *   - 캐싱 없음 (매번 재요청)
 *   - 코드 중복
 * 
 * React Query 사용 후:
 *   const { data, isLoading, error } = useBoonjangQuery();
 *   → 모든 것이 자동으로 관리됨!
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from './client';

// ============================================================
// 분쟁 유형 관련 훅 (useBoonjang)
// ============================================================

/**
 * 분쟁 목록 조회 훅
 * 
 * [사용법]
 * const { data, isLoading, error } = useBoonjangQuery();
 * 
 * [반환값]
 * - data: 서버에서 받은 분쟁 목록
 * - isLoading: 로딩 중이면 true
 * - error: 에러 발생 시 에러 객체
 */
export function useBoonjangQuery() {
    return useQuery({
        queryKey: ['boonjang'], // 캐시 키 (같은 키면 캐시 재사용)
        queryFn: () => apiGet('/api/boonjang'), // 실제 API 호출 함수
        staleTime: 1000 * 60 * 5, // 5분간 캐시 유지 (fresh 상태)
    });
}

/**
 * 분쟁 내용 분석 뮤테이션
 * 
 * [원리]
 * useMutation은 데이터를 "변경"하는 작업에 사용합니다.
 * - POST /api/boonjang 로 분쟁 내용 전송
 * - DB에 저장
 * - 분석 결과 반환
 * 
 * [사용법]
 * const mutation = useBoonjangMutation();
 * 
 * // 버튼 클릭 시
 * mutation.mutate({ boonjangInput: "분쟁 내용..." });
 * 
 * // 상태 확인
 * if (mutation.isPending) return <p>분석 중...</p>;
 * if (mutation.error) return <p>오류: {mutation.error.message}</p>;
 * if (mutation.data) return <결과 컴포넌트 data={mutation.data} />;
 */
export function useBoonjangMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => apiPost('/api/boonjang', data),
        onSuccess: () => {
            // 성공 시 분쟁 목록 캐시 무효화 (다시 조회)
            queryClient.invalidateQueries({ queryKey: ['boonjang'] });
        },
    });
}

// ============================================================
// 법적 위험 관련 훅 (useLaw)
// ============================================================

export function useLawQuery() {
    return useQuery({
        queryKey: ['law'],
        queryFn: () => apiGet('/api/law'),
        staleTime: 1000 * 60 * 5,
    });
}

// ============================================================
// 유사 판례 관련 훅 (useYusa)
// ============================================================

export function useYusaQuery() {
    return useQuery({
        queryKey: ['yusa'],
        queryFn: () => apiGet('/api/yusa'),
        staleTime: 1000 * 60 * 5,
    });
}

// ============================================================
// 조기 위험 관련 훅 (useJogi)
// ============================================================

export function useJogiQuery() {
    return useQuery({
        queryKey: ['jogi'],
        queryFn: () => apiGet('/api/jogi'),
        staleTime: 1000 * 60 * 5,
    });
}
