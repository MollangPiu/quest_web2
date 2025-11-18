import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'
import { checkDuplicate, signup } from '../api/authApi'

const Signup = () => {
  const [formData, setFormData] = useState({
    userId: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [verified, setVerified] = useState({
    userId: false,
    nickname: false,
    email: false,
  })
  const [checking, setChecking] = useState({
    userId: false,
    nickname: false,
    email: false,
  })
  const [fieldMessages, setFieldMessages] = useState({
    userId: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as 'userId' | 'nickname' | 'email' | 'password' | 'confirmPassword'
    const newValue = e.target.value
    
    setFormData({
      ...formData,
      [fieldName]: newValue,
    })
    
    // 값이 변경되면 중복 확인 상태 초기화
    if (fieldName === 'userId' || fieldName === 'nickname' || fieldName === 'email') {
      setVerified({
        ...verified,
        [fieldName]: false,
      })
      setFieldMessages({
        ...fieldMessages,
        [fieldName]: '',
      })
    }
    
    // 비밀번호 확인 검증
    if (fieldName === 'password' || fieldName === 'confirmPassword') {
      const password = fieldName === 'password' ? newValue : formData.password
      const confirmPassword = fieldName === 'confirmPassword' ? newValue : formData.confirmPassword
      
      // 비밀번호 확인 필드에 값이 있고, 두 비밀번호가 일치하지 않으면
      if (confirmPassword && password !== confirmPassword) {
        setFieldMessages({
          ...fieldMessages,
          confirmPassword: '비밀번호가 일치하지 않습니다.',
        })
      } else if (confirmPassword && password === confirmPassword) {
        // 일치하면 메시지 제거
        setFieldMessages({
          ...fieldMessages,
          confirmPassword: '',
        })
      } else if (!confirmPassword) {
        // 비밀번호 확인 필드가 비어있으면 메시지 제거
        setFieldMessages({
          ...fieldMessages,
          confirmPassword: '',
        })
      }
    }
  }

  /** 중복검사 */
  const handleCheckDuplicate = async (type: 'userId' | 'nickname' | 'email') => {
    const value = formData[type]
    const fieldName = type === 'userId' ? '아이디' : type === 'nickname' ? '닉네임' : '이메일'
    
    if (!value) {
      setFieldMessages({
        ...fieldMessages,
        [type]: `${fieldName}를 입력해주세요.`,
      })
      return
    }

    // 이메일 형식 검사
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        setFieldMessages({
          ...fieldMessages,
          [type]: '올바른 이메일 형식을 입력해주세요.',
        })
        return
      }
    }

    setChecking({
      ...checking,
      [type]: true,
    })
    setFieldMessages({
      ...fieldMessages,
      [type]: '',
    })

    try {
      const result = await checkDuplicate(type, value) //API 호출

      if (result.available) {
        setVerified({
          ...verified,
          [type]: true,
        })
        setFieldMessages({
          ...fieldMessages,
          [type]: '사용 가능합니다.',
        })
      } else {
        setFieldMessages({
          ...fieldMessages,
          [type]: result.message || `${fieldName}가 이미 사용 중입니다.`,
        })
        setVerified({
          ...verified,
          [type]: false,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '중복 확인 중 오류가 발생했습니다.'
      setFieldMessages({
        ...fieldMessages,
        [type]: errorMessage,
      })
    } finally {
      setChecking({
        ...checking,
        [type]: false,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!formData.userId || !formData.nickname || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    // 중복 확인 검사
    if (!verified.userId || !verified.nickname || !verified.email) {
      setError('아이디, 닉네임, 이메일 중복 확인을 완료해주세요.')
      return
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    try {
      await signup({
        userId: formData.userId,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
      })
      
      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/login')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
      setError(errorMessage)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1><span className="emoji">🎯</span> 퀘스트</h1>
          <p>새 계정을 만드세요</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="userId">아이디</label>
            <div className="input-with-button">
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                className={verified.userId ? 'verified' : ''}
                required
              />
              <button
                type="button"
                onClick={() => handleCheckDuplicate('userId')}
                disabled={checking.userId || !formData.userId}
                className="check-button"
              >
                {checking.userId ? '확인 중...' : verified.userId ? '✓ 확인됨' : '중복 확인'}
              </button>
            </div>
            {fieldMessages.userId && (
              <div className={`field-message ${verified.userId ? 'success' : 'error'}`}>
                {fieldMessages.userId}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <div className="input-with-button">
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                className={verified.nickname ? 'verified' : ''}
                required
              />
              <button
                type="button"
                onClick={() => handleCheckDuplicate('nickname')}
                disabled={checking.nickname || !formData.nickname}
                className="check-button"
              >
                {checking.nickname ? '확인 중...' : verified.nickname ? '✓ 확인됨' : '중복 확인'}
              </button>
            </div>
            {fieldMessages.nickname && (
              <div className={`field-message ${verified.nickname ? 'success' : 'error'}`}>
                {fieldMessages.nickname}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <div className="input-with-button">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
                className={verified.email ? 'verified' : ''}
                required
              />
              <button
                type="button"
                onClick={() => handleCheckDuplicate('email')}
                disabled={checking.email || !formData.email}
                className="check-button"
              >
                {checking.email ? '확인 중...' : verified.email ? '✓ 확인됨' : '중복 확인'}
              </button>
            </div>
            {fieldMessages.email && (
              <div className={`field-message ${verified.email ? 'success' : 'error'}`}>
                {fieldMessages.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              required
            />
            {fieldMessages.password && (
              <div className="field-message error">
                {fieldMessages.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {fieldMessages.confirmPassword && (
              <div className="field-message error">
                {fieldMessages.confirmPassword}
              </div>
            )}
          </div>

          <button type="submit" className="auth-button">
            회원가입
          </button>
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="auth-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup

