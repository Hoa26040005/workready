import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const { setIsAdminOpen } = useData();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'learning-resources', 'practice', 'dashboard', 'about'];
      const scrollPos = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Secret Triple Click on Logo opens Admin Login
  const handleLogoClick = (e) => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 3) {
      e.preventDefault();
      setIsAdminOpen(true);
      setClickCount(0);
    } else {
      setTimeout(() => setClickCount(0), 1000);
    }
  };

  return (
    <header className="navbar" id="main-navbar">
      <div className="nav-container">
        <a href="#home" className="logo" onClick={handleLogoClick} title="WorkReady">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="logo-text">WorkReady</span>
        </a>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`} style={menuOpen ? { display: 'flex', flexDirection: 'column', position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', padding: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', gap: '16px' } : {}}>
          <a href="#home" className={`nav-item ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#learning-resources" className={`nav-item ${activeSection === 'learning-resources' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Learning Resources</a>
          <a href="#practice" className={`nav-item ${activeSection === 'practice' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Question Practice</a>
          <a href="#dashboard" className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Try Assessment</a>
          <a href="#about" className={`nav-item ${activeSection === 'about' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>About WorkReady</a>
        </nav>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)} 
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
