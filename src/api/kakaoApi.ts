// 카카오 로그인 API 설정
// 백엔드 주소로 Redirect URI 설정
const getKakaoRedirectUri = () => {
  const envRedirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI
  if (envRedirectUri) {
    return envRedirectUri
  }
  // 개발 환경에서는 백엔드 주소 사용
  const isDev = (import.meta as any).env?.MODE === 'development'
  const backendUrl = isDev 
    ? 'http://localhost:8085' 
    : ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8085')
  return `${backendUrl}/api/auth/kakao/callback`
}

const KAKAO_REDIRECT_URI = getKakaoRedirectUri()

// API_BASE_URL 가져오기 (개발 환경에서는 프록시 사용)
const getApiBaseUrl = () => {
  try {
    const isDev = (import.meta as any).env?.MODE === 'development'
    return isDev ? '' : ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8085')
  } catch {
    return 'http://localhost:8085'
  }
}

// 백엔드에서 카카오 클라이언트 ID 가져오기
export const getKakaoClientId = async (): Promise<string> => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const url = `${apiBaseUrl}/api/auth/kakao/key`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('카카오 클라이언트 ID API 응답 오류:', response.status, errorText)
      throw new Error(`카카오 클라이언트 ID를 가져오는데 실패했습니다. (${response.status})`)
    }

    const data = await response.json()
    
    if (data.status === 200 && data.data) {
      return data.data
    } else {
      throw new Error(data.message || '카카오 클라이언트 ID를 가져오는데 실패했습니다.')
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('네트워크 오류: 서버에 연결할 수 없습니다.')
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
    throw error
  }
}

// 카카오 인증 URL 생성
export const getKakaoAuthUrl = (clientId: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: 'code',
    scope: 'account_email', // 카카오 로그인 시 이메일 권한만 요청
  })

  const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  console.log('생성된 카카오 인증 URL:', authUrl)
  console.log('Redirect URI:', KAKAO_REDIRECT_URI)
  return authUrl
}

// 카카오 로그인 시작 (인증 코드 요청)
export const startKakaoLogin = async (): Promise<void> => {
  try {
    // 백엔드에서 카카오 클라이언트 ID 가져오기
    const clientId = await getKakaoClientId()
    
    if (!clientId) {
      alert('카카오 로그인 설정이 필요합니다.')
      return
    }

    const authUrl = getKakaoAuthUrl(clientId)
    console.log('카카오 인증 URL:', authUrl)
    console.log('Redirect URI:', KAKAO_REDIRECT_URI)
    console.log('Client ID:', clientId)
    
    // 카카오 인증 페이지로 리다이렉트
    window.location.href = authUrl
  } catch (error) {
    console.error('카카오 로그인 시작 실패:', error)
    alert('카카오 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.')
  }
}

// 카카오 콜백에서 인증 코드 추출
export const getKakaoAuthCode = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('code')
}

// 카카오 에러 코드 추출
export const getKakaoError = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('error')
}

// 카카오 인증 코드를 백엔드로 전송하여 로그인 처리
export const loginWithKakaoCode = async (code: string) => {
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
  const url = `${apiBaseUrl}/api/auth/kakao/callback`
  
  console.log('백엔드 API 호출:', url, { code })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  console.log('백엔드 응답 상태:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('백엔드 에러 응답:', errorText)
    
    // 404 에러인 경우 특별 처리
    if (response.status === 404) {
      throw new Error('카카오 로그인 API 엔드포인트를 찾을 수 없습니다. 백엔드에 `/api/auth/kakao/callback` 엔드포인트가 구현되어 있는지 확인해주세요.')
    }
    
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText }
    }
    throw new Error(errorData.message || `카카오 로그인에 실패했습니다. (${response.status})`)
  }

  const data = await response.json()
  console.log('백엔드 성공 응답:', data)
  return data
}

