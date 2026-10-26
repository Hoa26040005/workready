import React from 'react';
import { useData } from '../context/DataContext';

export default function Footer() {
  const { setIsAdminOpen } = useData();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-left">
          <div className="footer-logo">WorkReady</div>
          <p className="footer-copy">
            Empowering career readiness & communication excellence. © 2026 WorkReady.
            <button 
              className="footer-admin-link"
              onClick={() => setIsAdminOpen(true)}
              title="Cổng quản trị viên (Phím tắt: Ctrl + Shift + A)"
            >
              🔒 Admin Access
            </button>
          </p>
        </div>

        <nav className="footer-links">
          <a href="#home">Home</a>
          <a href="#learning-resources">Learning Resources</a>
          <a href="#practice">Question Practice</a>
          <a href="#dashboard">Try Assessment</a>
          <a href="#about">About WorkReady</a>
        </nav>
      </div>
    </footer>
  );
}
