import React from 'react';

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="badge-pill">
            <span className="badge-dot"></span>
            FIND INTERNSHIP & PART-TIME JOB - A STUDENT LEARNING PLATFORM
          </div>

          <h1 className="hero-title">
            Get Ready. Speak Confidently. <span className="highlight">Get Hired.</span>
          </h1>

          <p className="hero-desc">
            Master interview English, polish communication skills, and build professional confidence through interactive exercises, curated learning materials, and practice questions.
          </p>

          <p className="hero-subdesc">
            Whether preparing for tech roles, internships, or corporate environments, our structured paths guide you step-by-step from foundational terminology to advanced behavioral interviews.
          </p>

          <div className="hero-actions">
            <a href="#practice" className="btn btn-primary">Get Started Now</a>
            <a href="#learning-resources" className="btn btn-link">
              Explore Learning Resources
              <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80" 
              alt="Young professional woman preparing for interviews with confidence on laptop"
              className="hero-img"
              loading="eager"
            />
            <div className="floating-badge">
              <div className="badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="badge-text">
                <strong>Prepare with purpose:</strong> Practice with confidence
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
