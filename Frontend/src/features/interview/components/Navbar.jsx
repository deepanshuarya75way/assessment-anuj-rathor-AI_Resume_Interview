import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import BrandLogo from '../../../components/BrandLogo';
import { 
  Compass, 
  FileText, 
  Mic, 
  BarChart2, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  User
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Interview Prep', path: '/', icon: <Compass size={16} /> },
    { label: 'Resume Builder', path: '/resume', icon: <FileText size={16} /> },
    { label: 'Mock Studio', path: '/mock', icon: <Mic size={16} /> },
    { label: 'Command Center', path: '/dashboard', icon: <BarChart2 size={16} /> },
  ];

  const onLogout = async () => {
    try {
      await handleLogout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (itemPath) => {
    if (itemPath === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/interview');
    }
    if (itemPath === '/resume') {
      return location.pathname.startsWith('/resume');
    }
    if (itemPath === '/mock') {
      return location.pathname.startsWith('/mock');
    }
    if (itemPath === '/dashboard') {
      return location.pathname.startsWith('/dashboard');
    }
    return location.pathname === itemPath;
  };

  const displayName = user?.username || user?.email?.split('@')[0] || 'Candidate';

  return (
    <header className="app-navbar" role="banner">
      <div className="app-navbar__inner">
        {/* Brand */}
        <div className="app-navbar__brand-wrap">
          <Link to="/" className="app-navbar__brand" aria-label="PrepAI Home">
            <BrandLogo size={30} />
            <div className="brand-text">
              <span className="brand-name">PrepAI</span>
              <span className="brand-tagline">From Resume to Ready</span>
            </div>
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="app-navbar__links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="nav-link__icon">{item.icon}</span>
                <span className="nav-link__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions / User */}
        <div className="app-navbar__actions">
          {user && (
            <div className="user-profile-badge" title={`Signed in as ${displayName}`}>
              <div className="user-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{displayName}</span>
              <span className="status-dot" title="Active session" />
            </div>
          )}

          <button 
            onClick={onLogout} 
            className="logout-btn" 
            title="Log out of session"
            aria-label="Logout"
          >
            <LogOut size={15} />
            <span className="logout-text">Exit</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Overlay rendered at document.body level */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {mobileMenuOpen && (
            <div 
              className="app-navbar__mobile-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          <div 
            className={`app-navbar__mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
            aria-hidden={!mobileMenuOpen}
          >
            <div className="mobile-drawer-header">
              <div className="mobile-user-info">
                <div className="user-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="mobile-user-name">{displayName}</p>
                  <p className="mobile-user-sub">Career Prep Active</p>
                </div>
              </div>
              <button 
                className="mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-nav">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-link ${active ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span className="mobile-nav-title">{item.label}</span>
                    {active && <span className="mobile-active-pill">Active</span>}
                  </Link>
                );
              })}
            </div>

            <div className="mobile-drawer-footer">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }} 
                className="mobile-logout-btn"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};

export default Navbar;
