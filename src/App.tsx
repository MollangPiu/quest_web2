import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import './asset/styles/style.css'
import './asset/styles/sidebar.css'

/** 사이드바  */
import Sidebar from './pages/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  const handleLogout = () => {
    // 로그아웃 로직 구현
    console.log('로그아웃')
  }

  // 로그인/회원가입 페이지는 사이드바 없이 표시
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    )
  }

  // 일반 페이지는 사이드바와 함께 표시
  return (
    <div className="main-container">
      <Sidebar handleLogout={handleLogout} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<div>홈 페이지</div>} />
          <Route path="/calendar" element={<div>일정 페이지</div>} />
          <Route path="/projects" element={<div>프로젝트 페이지</div>} />
          <Route path="/processes" element={<div>과제 페이지</div>} />
          <Route path="/quests" element={<div>퀘스트 페이지</div>} />
          <Route path="/friends" element={<div>친구 관리 페이지</div>} />
          <Route path="/profile" element={<div>프로필 변경 페이지</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

