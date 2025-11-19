import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Login.css'
import { checkDuplicate, signup } from '../api/authApi'
import kakaoLoginImage from '../asset/images/kakao/kakao_login_small.png'
import kakaoSharingImage from '../asset/images/kakao/kakaotalk_sharing_btn_small.png'
import naverIconImage from '../asset/images/naver/btnG_아이콘원형.png'

const Signup = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
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
  
  const [isFromKakao, setIsFromKakao] = useState(false)
  const [isFromSocial, setIsFromSocial] = useState(false)
  
  // 소셜 로그인 후 회원가입 페이지로 온 경우 이메일 자동 입력
  useEffect(() => {
    const email = searchParams.get('email')
    const from = searchParams.get('from')
    const isSocialLogin = from === 'kakao' || from === 'naver' || from === 'google'
    
    if (isSocialLogin && email) {
      setIsFromSocial(true)
      
      // 카카오에서 온 경우에만 카카오 이미지 표시
      if (from === 'kakao') {
        setIsFromKakao(true)
      }
      
      setFormData(prev => ({
        ...prev,
        email: email,
      }))
      // 소셜 로그인에서 온 경우 이메일은 이미 확인된 상태이므로 verified 처리
      setVerified(prev => ({
        ...prev,
        email: true,
      }))
      
      const providerName = from === 'kakao' ? '카카오' : from === 'naver' ? '네이버' : '구글'
      setFieldMessages(prev => ({
        ...prev,
        email: `${providerName} 이메일이 자동으로 입력되었습니다.`,
      }))
    }
  }, [searchParams])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 검사 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 파일 크기는 5MB 이하여야 합니다.')
        return
      }
      
      // 이미지 파일 형식 검사
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.')
        return
      }

      setProfileImage(file)
      
      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setProfileImagePreview(null)
    // 파일 입력 초기화
    const fileInput = document.getElementById('profileImage') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
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

          {/* 카카오 로그인으로 온 경우 카카오 이미지 표시 */}
          {isFromKakao && (
            <div className="kakao-welcome-container">
              <div className="kakao-image-wrapper">
                <img 
                  src={kakaoLoginImage} 
                  alt="카카오 로그인" 
                  className="kakao-welcome-image"
                />
                <div className="kakao-glow-effect"></div>
              </div>
              <p className="kakao-welcome-text">카카오 계정으로 회원가입을 진행합니다</p>
            </div>
          )}

          {/* 소셜 로그인(카카오/네이버/구글)으로 온 경우에만 소셜 로그인 버튼 표시 */}
          {isFromSocial && (
            <div className="social-login-buttons-container">
              <p className="social-login-title">소셜 로그인으로 간편하게 시작하세요</p>
              <div className="social-buttons-wrapper">
                <button 
                  type="button" 
                  className="social-login-button kakao-button"
                  onClick={() => {
                    // 카카오 로그인 처리
                    console.log('카카오 로그인')
                  }}
                >
                  <img 
                    src={kakaoSharingImage} 
                    alt="카카오 로그인" 
                    className="social-button-icon"
                  />
                  <span className="social-button-text">카카오</span>
                </button>

                <button 
                  type="button" 
                  className="social-login-button naver-button"
                  onClick={() => {
                    // 네이버 로그인 처리
                    console.log('네이버 로그인')
                  }}
                >
                  <img 
                    src={naverIconImage} 
                    alt="네이버 로그인" 
                    className="social-button-icon"
                  />
                  <span className="social-button-text">네이버</span>
                </button>

                <button 
                  type="button" 
                  className="social-login-button google-button gsi-material-button"
                  onClick={() => {
                    // 구글 로그인 처리
                    console.log('구글 로그인')
                  }}
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="social-button-text">구글</span>
                  </div>
                </button>
              </div>
            </div>
          )}

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

          {/* 프로필 이미지 업로드 */}
          <div className="form-group">
            <label>프로필 이미지 (선택사항)</label>
            <div className="profile-image-upload">
              {profileImagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={profileImagePreview} 
                    alt="프로필 미리보기" 
                    className="profile-image-preview"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="remove-image-button"
                    aria-label="이미지 제거"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="profile-image-placeholder">👤</div>
              )}
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="profileImage" className="file-input-label">
                  {profileImagePreview ? '이미지 변경' : '이미지 선택'}
                </label>
              </div>
              {profileImage && (
                <div className="file-name">{profileImage.name}</div>
              )}
            </div>
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

