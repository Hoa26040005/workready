import React from 'react';

const RESOURCES = [
  {
    id: 'video',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
        <line x1="7" y1="2" x2="7" y2="22"></line>
        <line x1="17" y1="2" x2="17" y2="22"></line>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <line x1="2" y1="7" x2="7" y2="7"></line>
        <line x1="2" y1="17" x2="7" y2="17"></line>
        <line x1="17" y1="17" x2="22" y2="17"></line>
        <line x1="17" y1="7" x2="22" y2="7"></line>
      </svg>
    ),
    title: 'Bite-Sized Instructional Videos',
    desc: 'Clear, engaging video lessons breaking down key concepts, from elevator pitches to salary negotiation.',
    meta: 'Duration: 3-5 mins per video • Interactive subtitles & practice prompts',
    btnText: 'Watch & Learn'
  },
  {
    id: 'guides',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    title: 'Comprehensive Guides and Sample Documents',
    desc: 'Ready-to-use templates, email scripts, professional bios, and resume bullet points tailored to your industry.',
    meta: 'Formats: PDF, Google Docs • Downloadable & customizable',
    btnText: 'Browse Guides'
  },
  {
    id: 'flashcards',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    title: 'Interactive Drills and Terminology Flashcards',
    desc: 'Rapid-fire vocabulary builder, technical interview drills, and phrasing exercises to sharpen your recall under pressure.',
    meta: 'Features: Audio pronunciation, spaced repetition quizzes',
    btnText: 'Practice Vocabulary'
  },
  {
    id: 'cases',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    title: 'Case Samples for Technical & Workplace Problem-Solving',
    desc: 'Scenario-based workplace situations, handling conflict, client communications, and agile workflow discussions.',
    meta: 'Includes: Sample responses, common mistakes to avoid',
    btnText: 'Explore Case Studies'
  },
  {
    id: 'quiz',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    ),
    title: 'Self-Assessment Quizzes',
    desc: 'Evaluate your readiness with instant feedback, benchmark scores against industry peers, and personalized tips for improvement.',
    meta: 'Format: 15-question assessments • Detailed explanation for each answer',
    btnText: 'Take a Quiz'
  }
];

export default function LearningResources({ onOpenModal }) {
  return (
    <section className="resources-section" id="learning-resources">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">FLEXIBLE LEARNING</span>
          <h2 className="section-title">Choose Your Learning Resources</h2>
          <p className="section-desc">
            Explore structured learning modules designed to elevate your professional communication and career readiness.
          </p>
        </div>

        <div className="resources-grid">
          {RESOURCES.map((item) => (
            <div className="resource-card" key={item.id}>
              <div className="card-icon-wrapper">
                {item.icon}
              </div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
              <div className="card-meta">
                <strong>{item.meta.split(':')[0]}:</strong>{item.meta.substring(item.meta.indexOf(':') + 1)}
              </div>
              <button 
                className="btn btn-card-action"
                onClick={() => onOpenModal(item.id)}
              >
                {item.btnText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
