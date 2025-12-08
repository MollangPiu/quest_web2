// 네이버 로그인 API 설정
// 프론트엔드 주소로 Redirect URI 설정
const getNaverRedirectUri = () => {
  const envRedirectUri = import.meta.env.VITE_NAVER_REDIRECT_URI
  if (envRedirectUri) {
    return envRedirectUri
  }
  // 개발 환경에서는 프론트엔드 주소 사용
  const isDev = (import.meta as any).env?.MODE === 'development'
  const frontendUrl = isDev 
    ? 'http://localhost:5173' 
    : (window.location.origin || 'http://localhost:5173')
  return `${frontendUrl}/auth/naver/callback`
}

const NAVER_REDIRECT_URI = getNaverRedirectUri()

// API_BASE_URL 가져오기 (개발 환경에서는 프록시 사용)
const getApiBaseUrl = () => {
  try {
    const isDev = (import.meta as any).env?.MODE === 'development'
    return isDev ? '' : ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8085')
  } catch {
    return 'http://localhost:8085'
  }
}

// 백엔드에서 네이버 클라이언트 ID 가져오기
export const getNaverClientId = async (): Promise<string> => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const url = `${apiBaseUrl}/api/auth/naver/key`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('네이버 클라이언트 ID API 응답 오류:', response.status, errorText)
      throw new Error(`네이버 클라이언트 ID를 가져오는데 실패했습니다. (${response.status})`)
    }

    const data = await response.json()
    
    if (data.status === 200 && data.data) {
      return data.data
    } else {
      throw new Error(data.message || '네이버 클라이언트 ID를 가져오는데 실패했습니다.')
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('네트워크 오류: 서버에 연결할 수 없습니다.')
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
    throw error
  }
}

// 네이버 인증 URL 생성
export const getNaverAuthUrl = (clientId: string): string => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  localStorage.setItem('naver_oauth_state', state)
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: NAVER_REDIRECT_URI,
    state: state,
  })

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
  console.log('생성된 네이버 인증 URL:', authUrl)
  console.log('Redirect URI:', NAVER_REDIRECT_URI)
  return authUrl
}

// 네이버 로그인 시작 (인증 코드 요청)
export const startNaverLogin = async (): Promise<void> => {
  try {
    // 백엔드에서 네이버 클라이언트 ID 가져오기
    const clientId = await getNaverClientId()
    
    if (!clientId) {
      alert('네이버 로그인 설정이 필요합니다.')
      return
    }

    const authUrl = getNaverAuthUrl(clientId)
    console.log('네이버 인증 URL:', authUrl)
    console.log('Redirect URI:', NAVER_REDIRECT_URI)
    console.log('Client ID:', clientId)
    
    // 네이버 인증 페이지로 리다이렉트
    window.location.href = authUrl
  } catch (error) {
    console.error('네이버 로그인 시작 실패:', error)
    alert('네이버 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.')
  }
}

// 네이버 콜백에서 인증 코드 추출
export const getNaverAuthCode = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('code')
}

// 네이버 에러 코드 추출
export const getNaverError = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('error')
}

// 네이버 state 확인
export const verifyNaverState = (state: string | null): boolean => {
  const savedState = localStorage.getItem('naver_oauth_state')
  if (savedState && state === savedState) {
    localStorage.removeItem('naver_oauth_state')
    return true
  }
  return false
}

// 네이버 인증 코드를 백엔드로 전송하여 로그인 처리
export const loginWithNaverCode = async (code: string) => {
  // API_BASE_URL 가져오기 (개발 환경에서는 프록시 사용)
  const getApiBaseUrl = () => {
    try {
      const isDev = (import.meta as any).env?.MODE === 'development'
      return isDev ? '' : ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8085')
    } catch {
      return 'http://localhost:8085'
    }
  }

  const apiBaseUrl = getApiBaseUrl()
  const url = `${apiBaseUrl}/api/auth/naver/callback`
  
  // state도 함께 전송
  const state = new URLSearchParams(window.location.search).get('state')
  
  console.log('백엔드 API 호출:', url, { code, state })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state }),
  })

  console.log('백엔드 응답 상태:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('백엔드 에러 응답:', errorText)
    
    // 404 에러인 경우 특별 처리
    if (response.status === 404) {
      throw new Error('네이버 로그인 API 엔드포인트를 찾을 수 없습니다. 백엔드에 `/api/auth/naver/callback` 엔드포인트가 구현되어 있는지 확인해주세요.')
    }
    
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText }
    }
    throw new Error(errorData.message || `네이버 로그인에 실패했습니다. (${response.status})`)
  }

  const data = await response.json()
  console.log('백엔드 성공 응답:', data)
  return data
}

