import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Login.css'
import { login } from '../api/authApi'
import { startKakaoLogin } from '../api/kakaoApi'
import kakaoLoginImage from '../asset/images/kakao/kakao_login_medium_wide.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 카카오 로그인 후 리다이렉트된 경우 토큰 처리
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      // 토큰을 localStorage에 저장
      localStorage.setItem('token', token)
      
      // 사용자 정보가 있으면 함께 저장 (백엔드에서 전달한 경우)
      const user = searchParams.get('user')
      if (user) {
        try {
          localStorage.setItem('user', user)
        } catch (e) {
          console.error('사용자 정보 저장 실패:', e)
        }
      }
      
      // 로그인 성공 시 홈으로 이동
      navigate('/')
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 간단한 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      const result = await login(email, password)
      
      // 토큰과 사용자 정보 저장
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      
      // 로그인 성공 시 홈으로 이동
      navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.'
      setError(errorMessage)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1><span className="emoji">🎯</span> 퀘스트</h1>
          <p>로그인하여 계속하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            로그인
          </button>
        </form>

        <div className="social-login-divider">
          <span>또는</span>
        </div>

        <button 
          type="button" 
          className="kakao-login-button"
          onClick={startKakaoLogin}
        >
          <img 
            src={kakaoLoginImage} 
            alt="카카오 로그인" 
            className="kakao-login-image"
          />
        </button>

        <div className="auth-footer">
          <p>
            계정이 없으신가요?{' '}
            <Link to="/signup" className="auth-link">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

