import { Routes, Route } from 'react-router-dom'
import './App.css'
import './asset/styles/style.css'
import './asset/styles/sidebar.css'

/** 사이드바  */
import Sidebar from './pages/Sidebar'

function App() {
  const handleLogout = () => {
    // 로그아웃 로직 구현
    console.log('로그아웃')
  }

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
        </Routes>
      </main>
    </div>
  )
}

export default App

