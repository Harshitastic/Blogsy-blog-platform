'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { Feather, LogIn, LogOut, LayoutDashboard, UserPlus, BookOpen, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="main-header glass-panel">
      <div className="container header-container">
        <Link href="/" className="logo-link">
          <BookOpen className="logo-icon" size={24} />
          <span className="logo-text text-gradient-style">Blogsy</span>
        </Link>

        <nav className="nav-links">
          {mounted && (
            <button 
              onClick={toggleTheme} 
              className="btn-theme-toggle" 
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{ marginRight: '8px' }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          )}

          {loading ? (
            <div className="nav-skeleton"></div>
          ) : user ? (
            <>
              <Link href="/posts/new" className="nav-btn-write btn-primary">
                <Feather size={16} />
                <span>Write</span>
              </Link>
              
              <Link href="/dashboard" className="nav-link-item">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              
              <div className="user-profile-badge">
                <span className="profile-initial">{user.username[0].toUpperCase()}</span>
                <span className="profile-name">{user.name || user.username}</span>
              </div>
              
              <button onClick={logout} className="nav-btn-logout btn-secondary" title="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link-item">
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
              
              <Link href="/register" className="nav-btn-signup btn-primary">
                <UserPlus size={16} />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
