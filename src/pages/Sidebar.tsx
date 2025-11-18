import React from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
    handleLogout: () => void
};

const Sidebar:React.FC<SidebarProps> = ({ handleLogout }) => {
    return (
        <aside className="sidebar">
        <div className="sidebar-header">
          <div className="workspace-logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">퀘스트</span>
          </div>
          <p className="workspace-type">개인 워크스페이스</p>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-item active">
            <span className="nav-icon">✨</span>
            <span className="nav-text">오늘의 퀘스트</span>
          </Link>
          <Link to="/calendar" className="nav-item">
            <span className="nav-icon">📅</span>
            <span className="nav-text">일정</span>
          </Link>
          
          {/* 프로젝트 관리 (서브메뉴 포함) */}
          <div className="nav-group">
            <button className="nav-item" data-tab="projects" id="projects-nav">
              <span className="nav-icon">📁</span>
              <span className="nav-text">프로젝트 관리</span>
              <span className="nav-arrow">›</span>
            </button>
            <div className="sub-nav" id="projects-subnav">
              <Link to="/projects" className="sub-nav-item active">
                <span className="sub-icon">📁</span>
                <span className="sub-text">프로젝트</span>
              </Link>
              <Link to="/processes" className="sub-nav-item">
                <span className="sub-icon">⚙️</span>
                <span className="sub-text">과제</span>
              </Link>
              <Link to="/quests" className="sub-nav-item">
                <span className="sub-icon">⚡</span>
                <span className="sub-text">퀘스트</span>
              </Link>
            </div>
          </div>
          
          <div className="nav-divider"></div>
          
          <Link to="/friends" className="nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-text">친구 관리</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">프로필 변경</span>
          </Link>
          <Link to="/login" className="nav-item">
            <span className="nav-icon">🔒</span>
            <span className="nav-text">로그인</span>
          </Link>
          <Link to="/signup" className="nav-item">
            <span className="nav-icon">🔒</span>
            <span className="nav-text">회원가입</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar-big">👤</div>
            <div className="user-details">
              <span className="user-name">홍길동</span>
              <span className="user-email">user@example.com</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </aside>
    );
};

export default Sidebar;