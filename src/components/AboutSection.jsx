import React from 'react';

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="container about-container">
        <div className="about-content">
          <span className="section-tag">WHO WE ARE & WHAT WE DO</span>
          <h2 className="section-title">About WorkReady</h2>
          
          <p className="about-paragraph">
            WorkReady is an interactive learning platform designed to bridge the gap between academic education and professional career readiness. We empower students and early-career professionals with practical communication skills, authentic interview simulations, and actionable workplace knowledge.
          </p>

          <p className="about-paragraph">
            Our curriculum is developed by experienced recruiters, corporate hiring managers, and speech coaches who understand what modern employers look for in candidates.
          </p>

          <div className="about-highlights">
            <div className="highlight-item">
              <div className="highlight-number">10k+</div>
              <div className="highlight-label">Students Guided</div>
            </div>
            <div className="highlight-item">
              <div className="highlight-number">94%</div>
              <div className="highlight-label">Interview Success Rate</div>
            </div>
            <div className="highlight-item">
              <div className="highlight-number">50+</div>
              <div className="highlight-label">Partner Universities</div>
            </div>
          </div>
        </div>

        <div className="about-visual">
          <div className="about-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80" 
              alt="Students in lecture amphitheater collaborating with laptops"
              className="about-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
