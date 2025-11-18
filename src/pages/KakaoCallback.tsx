import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getKakaoAuthCode, getKakaoError, loginWithKakaoCode } from '../api/kakaoApi'
import './Login.css'

const KakaoCallback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        // 에러 확인
        const errorCode = getKakaoError()
        if (errorCode) {
          console.error('카카오 에러 코드:', errorCode)
          setError(`카카오 로그인에 실패했습니다. (에러: ${errorCode})`)
          setLoading(false)
          setTimeout(() => {
            navigate('/login')
          }, 2000)
          return
        }

        // 인증 코드 추출
        const code = getKakaoAuthCode()
        console.log('받은 인증 코드:', code)
        
        if (!code) {
          console.error('인증 코드가 없습니다.')
          setError('인증 코드를 받지 못했습니다.')
          setLoading(false)
          setTimeout(() => {
            navigate('/login')
          }, 2000)
          return
        }

        console.log('백엔드로 인증 코드 전송 중...')
        // 백엔드로 인증 코드 전송
        const result = await loginWithKakaoCode(code)
        console.log('백엔드 응답:', result)

        // 토큰과 사용자 정보 저장
        if (result.token) {
          localStorage.setItem('token', result.token)
        }
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user))
        }

        // 로그인 성공 시 홈으로 이동
        navigate('/')
      } catch (err) {
        console.error('카카오 콜백 처리 오류:', err)
        const errorMessage = err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.'
        setError(errorMessage)
        setLoading(false)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    }

    handleKakaoCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1><span className="emoji">🎯</span> 퀘스트</h1>
            <p>카카오 로그인 처리 중...</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#64748b' }}>잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1><span className="emoji">🎯</span> 퀘스트</h1>
        </div>
        {error && (
          <div className="error-message" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          로그인 페이지로 이동합니다...
        </div>
      </div>
    </div>
  )
}

export default KakaoCallback

