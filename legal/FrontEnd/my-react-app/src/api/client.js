/**
 * API 클라이언트 헬퍼 함수
 * 
 * [원리 설명]
 * - 모든 API 호출을 중앙화하여 일관된 에러 처리와 설정을 적용
 * - credentials: 'include'로 세션 쿠키(JSESSIONID)를 자동 전송
 * - Spring Security 세션 기반 인증과 연동
 * 
 * [왜 필요한가?]
 * - 각 페이지에서 fetch를 직접 호출하면 코드 중복 발생
 * - HTTP 상태 코드 확인, JSON 파싱, 에러 처리가 일관되지 않음
 * - 환경별 API 베이스 URL 관리 필요
 */

// 환경 변수에서 API 베이스 URL 가져오기 (개발 시 Vite 프록시가 처리하므로 비워둠)
const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * GET 요청 헬퍼
 * @param {string} path - API 경로 (예: '/api/boonjang')
 * @returns {Promise<any>} - JSON 응답 데이터
 */
export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include', // 세션 쿠키 자동 전송 (JSP 로그인 연동)
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // HTTP 상태 코드 확인
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  // JSON 파싱 (응답이 비어있으면 null 반환)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * POST 요청 헬퍼
 * @param {string} path - API 경로 (예: '/api/boonjang')
 * @param {object} data - 전송할 데이터
 * @returns {Promise<any>} - JSON 응답 데이터
 * 
 * [의도]
 * - 분쟁 내용을 입력받아 백엔드로 전송
 * - DB에 저장하고 분석 결과를 반환받음
 */
export async function apiPost(path, data) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include', // 세션 쿠키 자동 전송
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
