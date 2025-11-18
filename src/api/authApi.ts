import { API_BASE_URL, API_ENDPOINTS, IS_DEV } from '../config/apiConfig'

// API 응답 타입 정의
interface ApiResponse<T> {
  status: number
  message: string | null
  data: T
  timestamp: string
}

interface CheckDuplicateResponse {
  available: boolean
  message?: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    userId: string
    nickname: string
    email: string
  }
}

interface SignupResponse {
  success: boolean
  message: string
}

// 중복 확인 API
export const checkDuplicate = async (
  type: 'userId' | 'nickname' | 'email',
  value: string
): Promise<CheckDuplicateResponse> => {
  // 아이디 체크는 별도 엔드포인트 사용
  let endpoint = ''
  let requestBody: Record<string, string> = {}
  
  // 아이디 중복 검사
  if (type === 'userId') {
    endpoint = API_ENDPOINTS.AUTH.ID_CHECK
    requestBody = { userId: value }
  } else {
    // 닉네임과 이메일은 추후 구현
    endpoint = API_ENDPOINTS.AUTH.CHECK_DUPLICATE(type)
    requestBody = { [type]: value }
  }

  const requestUrl = `${API_BASE_URL}${endpoint}`

  try {
    // API 요청하기
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    // 응답 처리
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<string> = await response.json()
    
    // data가 "success"면 사용 가능, "fail"이면 사용 불가
    if (data.status === 200) {
      const isAvailable = data.data === 'success'
      return {
        available: isAvailable,
        message: isAvailable ? undefined : '이미 사용 중입니다.',
      }
    } else {
      throw new Error(data.message || '중복 확인에 실패했습니다.')
    }
  } catch (error) {
    // 개발 환경에서는 네트워크 에러 발생 시 시뮬레이션 모드로 동작
    if (IS_DEV) {
      await new Promise(resolve => setTimeout(resolve, 500)) // 시뮬레이션 딜레이
      return { available: true }
    }
    
    // 프로덕션 환경에서는 에러 throw
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
    throw error
  }
}

// 로그인 API
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '로그인에 실패했습니다.')
    }

    const data: ApiResponse<LoginResponse> = await response.json()
    
    if (data.status === 200 && data.data) {
      return data.data
    } else {
      throw new Error(data.message || '로그인에 실패했습니다.')
    }
  } catch (error) {
    throw error
  }
}

// 회원가입 API
export const signup = async (formData: {
  userId: string
  nickname: string
  email: string
  password: string
}): Promise<SignupResponse> => {
  try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '회원가입에 실패했습니다.')
    }

    const data: ApiResponse<SignupResponse> = await response.json()
    
    if (data.status === 200 && data.data) {
      return data.data
    } else {
      throw new Error(data.message || '회원가입에 실패했습니다.')
    }
  } catch (error) {
    throw error
  }
}

// 로그아웃 API
export const logout = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token')
    
    await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch (error) {
    // 로그아웃은 실패해도 로컬 스토리지 정리
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

