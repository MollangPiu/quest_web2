// API 기본 URL 설정
// 환경 변수에서 가져오거나 기본값 사용
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    return (import.meta as any).env?.[key] || defaultValue
  } catch {
    return defaultValue
  }
}

// 개발 환경 여부
export const IS_DEV = getEnvVar('MODE', 'development') === 'development'

// 개발 환경에서는 프록시를 통해 API 호출, 프로덕션에서는 직접 호출
export const API_BASE_URL = IS_DEV 
  ? '' // 개발 환경: Vite 프록시 사용 (상대 경로)
  : getEnvVar('VITE_API_BASE_URL', 'http://localhost:8085') // 프로덕션: 전체 URL

// API 엔드포인트 설정
export const API_ENDPOINTS = {
  AUTH: {
    CHECK_DUPLICATE: (type: string) => `/api/auth/check-${type}`,
    ID_CHECK: '/api/auth/idCheck',
    NICKNAME_CHECK: '/api/auth/nicknameCheck',
    EMAIL_CHECK: '/api/auth/emailCheck',
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
  },
} as const

