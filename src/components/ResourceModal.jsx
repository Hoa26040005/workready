import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

export default function ResourceModal({ activeModal, onClose }) {
  if (!activeModal) return null;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        {activeModal === 'video' && <VideoModal />}
        {activeModal === 'guides' && <GuidesModal />}
        {activeModal === 'flashcards' && <FlashcardsModal />}
        {activeModal === 'cases' && <CaseStudyModal />}
        {activeModal === 'quiz' && <QuizModal />}
      </div>
    </div>
  );
}

// Helper to extract embed url for YouTube / Vimeo
function getEmbedVideoUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return null;
}

// 1. VIDEO LESSON MODAL
function VideoModal() {
  const { videos } = useData();
  const [selectedVideo, setSelectedVideo] = useState(videos[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('playlist');

  const embedUrl = selectedVideo?.videoUrl ? getEmbedVideoUrl(selectedVideo.videoUrl) : null;
  const isDirectVideo = selectedVideo?.videoUrl && selectedVideo.videoUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">BITE-SIZED VIDEO LESSON</span>
        <h3 className="modal-title">{selectedVideo?.title || 'Instructional Video Lesson'}</h3>
        <p className="modal-subtitle">
          Instructor: {selectedVideo?.instructor || 'WorkReady Talent Team'}
        </p>
      </div>

      <div className="video-player-wrapper">
        {embedUrl ? (
          <div className="video-embed-container">
            <iframe 
              src={embedUrl} 
              title={selectedVideo?.title || 'Video Player'} 
              className="video-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : isDirectVideo ? (
          <video 
            src={selectedVideo.videoUrl} 
            controls 
            autoPlay 
            className="video-direct-player"
          />
        ) : (
          <div className="video-player-mock">
            <div className="video-screen">
              <div className="video-overlay-elements">
                <button 
                  className={`play-pause-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  )}
                </button>
                <span className="video-time-tag">{isPlaying ? `01:24 / ${selectedVideo?.duration || '03:45'}` : `00:00 / ${selectedVideo?.duration || '03:45'}`}</span>
              </div>
              <div className="video-progress-line">
                <div className="video-progress-filled" style={{ width: isPlaying ? '38%' : '0%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="video-modal-body">
        <div className="modal-tabs">
          <button 
            className={`modal-tab-btn ${activeTab === 'playlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlist')}
          >
            Video Course Playlist ({videos.length} Lessons)
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            Key Takeaways & Notes
          </button>
        </div>

        {activeTab === 'playlist' ? (
          <div className="playlist-list">
            {videos.map((item) => (
              <div 
                className={`playlist-item ${selectedVideo?.id === item.id ? 'active' : ''}`} 
                key={item.id}
                onClick={() => {
                  setSelectedVideo(item);
                  setIsPlaying(false);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="playlist-play-icon">▶</span>
                  <div>
                    <span className="playlist-title">{item.title}</span>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                      {item.instructor}
                    </span>
                  </div>
                </div>
                <span className="playlist-duration">{item.duration}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="transcript-box">
            <div className="transcript-line active">
              <span className="timestamp">00:15</span>
              <p><strong>Overview:</strong> {selectedVideo?.summary || 'Focus on value proposition and clarity.'}</p>
            </div>
            <div className="transcript-line">
              <span className="timestamp">00:48</span>
              <p><strong>Prove with 1 Key Metric:</strong> Give one high-impact achievement that demonstrates technical competence.</p>
            </div>
            <div className="transcript-line">
              <span className="timestamp">01:30</span>
              <p><strong>Connect to the Role:</strong> Explain why this specific company vision matches your career objectives.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. COMPREHENSIVE GUIDES MODAL
function GuidesModal() {
  const [copiedId, setCopiedId] = useState(null);
  const [downloadMsg, setDownloadMsg] = useState('');

  const guides = [
    {
      id: 1,
      title: 'Tech & Engineering Resume Action Verbs & Metrics',
      type: 'PDF Cheat Sheet',
      size: '1.2 MB',
      description: 'Over 120 strong action verbs, quantifiable formula templates (Achieved X measured by Y by doing Z).'
    },
    {
      id: 2,
      title: 'Cold Outreach LinkedIn Script to Tech Recruiters',
      type: 'Email Script',
      size: 'Copyable Text',
      description: 'High-conversion cold message template with 42% response rate in junior software roles.',
      content: `Hi [Recruiter Name],\n\nI noticed your team is building [Specific Feature/Project] at [Company Name]. As a developer focused on React and responsive web architecture, I built a prototype solving [Specific Problem].\n\nI’d love to share a 2-minute walkthrough if your engineering team is considering new team members this quarter.\n\nBest regards,\n[Your Name]`
    },
    {
      id: 3,
      title: 'Post-Interview Thank You & Follow-Up Email Template',
      type: 'Email Template',
      size: 'Copyable Text',
      description: 'Strategic thank you note connecting an idea discussed during the interview to subsequent action.',
      content: `Dear [Interviewer Name],\n\nThank you for taking the time to discuss the [Job Title] role today. I enjoyed learning about your current focus on [Specific Technical Challenge discussed].\n\nFollowing our conversation, I drafted a quick architecture diagram for how we might optimize [Topic]. Looking forward to next steps!\n\nWarm regards,\n[Your Name]`
    }
  ];

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (filename) => {
    const blob = new Blob([`WorkReady Official Resource: ${filename}\n\nContents verified by WorkReady Career Mentors.\nVisit http://localhost:5173 for full mock drills.`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadMsg(`Downloaded "${filename}" successfully!`);
    setTimeout(() => setDownloadMsg(''), 3000);
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">DOWNLOADABLE GUIDES & TEMPLATES</span>
        <h3 className="modal-title">Comprehensive Guides & Sample Documents</h3>
      </div>

      {downloadMsg && <div className="alert-success">{downloadMsg}</div>}

      <div className="guides-list">
        {guides.map((g) => (
          <div className="guide-card" key={g.id}>
            <div className="guide-header">
              <div>
                <span className="guide-type-pill">{g.type}</span>
                <h4 className="guide-title">{g.title}</h4>
              </div>
              <span className="guide-size">{g.size}</span>
            </div>
            <p className="guide-desc">{g.description}</p>

            <div className="guide-actions">
              {g.content ? (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleCopy(g.id, g.content)}
                >
                  {copiedId === g.id ? '✓ Copied to Clipboard!' : 'Copy Template Script'}
                </button>
              ) : (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleDownload(g.title)}
                >
                  📥 Download Guide
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. INTERACTIVE FLASHCARDS & VOCABULARY DRILL MODAL
function FlashcardsModal() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const cards = [
    {
      term: 'Cross-Functional Collaboration',
      phonetic: '/krɒs ˈfʌŋkʃənl kəˌlæbəˈreɪʃn/',
      meaning: 'Working jointly with team members from different departments (e.g., engineering, design, marketing) to achieve a unified business goal.',
      example: '"In my previous project, I led cross-functional collaboration between frontend engineers and UI/UX designers to reduce onboarding drop-off by 30%."'
    },
    {
      term: 'STAR Methodology',
      phonetic: '/stɑːr mɛθəˈdɒlədʒi/',
      meaning: 'A structured interview framework: Situation (context), Task (goal), Action (steps taken), Result (tangible metrics and outcomes).',
      example: '"I used the STAR methodology to concisely demonstrate how I resolved critical production server latency under pressure."'
    },
    {
      term: 'Deliverable-Oriented',
      phonetic: '/dɪˈlɪvərəbl ˈɔːriɛntɪd/',
      meaning: 'Focusing intensely on producing tangible, high-quality results within established deadlines and milestone targets.',
      example: '"Our agile team is highly deliverable-oriented, consistently shipping functional user stories every two-week sprint."'
    },
    {
      term: 'Stakeholder Alignment',
      phonetic: '/ˈsteɪkˌhoʊldər əˈlaɪnmənt/',
      meaning: 'Ensuring all key parties (clients, executives, teammates) share the exact same expectations and priorities.',
      example: '"Before implementing the architecture changes, I organized a kickoff sync to ensure complete stakeholder alignment."'
    },
    {
      term: 'Scalability & Extensibility',
      phonetic: '/ˌskeɪləˈbɪləti ænd ɪkˌstɛnsəˈbɪləti/',
      meaning: 'Designing software or processes that effortlessly handle exponential growth without architectural breakdown.',
      example: '"I prioritized modular design patterns to guarantee high scalability and extensibility as our user base grows."'
    }
  ];

  const current = cards[currentIndex];

  const speakTerm = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const markMastered = () => {
    setMasteredCount((prev) => prev + 1);
    handleNext();
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">VOCABULARY & PHRASING DRILL</span>
        <h3 className="modal-title">Interactive Terminology Flashcards</h3>
        <p className="modal-subtitle">Click the card to reveal the definition and interview usage.</p>
      </div>

      <div className="flashcard-status-bar">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className="mastered-tag">Mastered: {masteredCount}</span>
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        {!flipped ? (
          <div className="flashcard-front">
            <div className="flashcard-chip">TERM</div>
            <h2 className="flashcard-term">{current.term}</h2>
            <div className="flashcard-phonetic">{current.phonetic}</div>
            <button 
              className="audio-btn" 
              onClick={(e) => { e.stopPropagation(); speakTerm(current.term); }}
              title="Pronounce in English"
            >
              🔊 Listen Pronunciation
            </button>
            <span className="flip-hint">👆 Click to flip & view example</span>
          </div>
        ) : (
          <div className="flashcard-back">
            <div className="flashcard-chip chip-back">EXPLANATION & INTERVIEW USAGE</div>
            <p className="flashcard-meaning">{current.meaning}</p>
            <div className="flashcard-example">
              <strong>Interview Sample Sentence:</strong>
              <p>{current.example}</p>
            </div>
            <button 
              className="audio-btn" 
              onClick={(e) => { e.stopPropagation(); speakTerm(current.example); }}
              title="Listen to full sample"
            >
              🔊 Listen Sample Sentence
            </button>
            <span className="flip-hint">👆 Click to flip back</span>
          </div>
        )}
      </div>

      <div className="flashcard-controls">
        <button className="btn btn-sm btn-dark" onClick={handlePrev}>← Previous</button>
        <button className="btn btn-sm btn-primary" onClick={markMastered}>✓ I Know This</button>
        <button className="btn btn-sm btn-dark" onClick={handleNext}>Next Card →</button>
      </div>
    </div>
  );
}

// 4. CASE SAMPLES FOR PROBLEM SOLVING MODAL
function CaseStudyModal() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const scenario = {
    title: 'Scenario: Unclear Specifications & Tight Sprint Deadline',
    context: 'You are two days away from a scheduled sprint delivery for a client portal. You discover that the API contract provided by the backend team has missing fields not accounted for in the UI mockups. What do you do?',
    options: [
      {
        id: 'A',
        text: 'Work through the night silently building mock data so the UI looks complete for the demo, hoping the backend fixes it next week.',
        correct: false,
        feedback: '❌ High Risk: Hiding technical discrepancy leads to surprises on production. Interviewers look for transparent communication.'
      },
      {
        id: 'B',
        text: 'Immediately schedule a 15-minute sync with the backend lead and product manager, present the exact field discrepancy, and propose an interim fallback so shipping is not blocked.',
        correct: true,
        feedback: '✅ Best Choice (What Hiring Managers Want): This showcases proactive problem-solving, transparency, and collaborative agility.'
      },
      {
        id: 'C',
        text: 'Stop frontend development immediately and file a blocking ticket, waiting for the backend team to resolve it.',
        correct: false,
        feedback: '⚠️ Passive: While filing a ticket is correct, halting progress without proposing a workaround shows lack of initiative.'
      }
    ]
  };

  const handleSelect = (id) => {
    setSelectedOption(id);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">WORKPLACE PROBLEM-SOLVING CASE STUDY</span>
        <h3 className="modal-title">{scenario.title}</h3>
      </div>

      <div className="case-context-box">
        <span className="case-badge">SCENARIO BRIEF</span>
        <p>{scenario.context}</p>
      </div>

      <div className="case-options-list">
        <span className="options-title">How would you respond in an interview?</span>
        {scenario.options.map((opt) => (
          <div 
            key={opt.id}
            className={`case-option-item ${selectedOption === opt.id ? (opt.correct ? 'correct' : 'incorrect') : ''}`}
            onClick={() => handleSelect(opt.id)}
          >
            <div className="option-indicator">{opt.id}</div>
            <div className="option-text">{opt.text}</div>
          </div>
        ))}
      </div>

      {submitted && (
        <div className="case-feedback-box">
          <p>{scenario.options.find(o => o.id === selectedOption)?.feedback}</p>
          <button className="btn btn-sm btn-dark" onClick={handleReset} style={{ marginTop: '10px' }}>
            Try Another Approach
          </button>
        </div>
      )}
    </div>
  );
}

// 5. SELF-ASSESSMENT QUIZ MODAL
function QuizModal() {
  const { quizzes } = useData();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const questions = quizzes && quizzes.length > 0 ? quizzes : [
    {
      question: 'What does the letter "A" in the STAR interview framework stand for?',
      options: ['Approach', 'Action', 'Ambition', 'Analysis'],
      answerIndex: 1,
      explanation: '"Action" represents the specific steps and contributions you individually made to solve the challenge.'
    }
  ];

  const current = questions[currentQ];

  const handleSelectAnswer = (idx) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    if (idx === current.answerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setFinished(false);
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">ASSESSMENT DRILL</span>
        <h3 className="modal-title">Career Readiness Quick Quiz</h3>
      </div>

      {!finished && current ? (
        <div className="quiz-body">
          <div className="quiz-progress-row">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>Score: {score} / {questions.length}</span>
          </div>

          <h4 className="quiz-question-title">{current.question}</h4>

          <div className="quiz-options-list">
            {current.options.map((opt, idx) => {
              let stateClass = '';
              if (isAnswered) {
                if (idx === current.answerIndex) stateClass = 'correct';
                else if (idx === selectedAnswer) stateClass = 'incorrect';
              }
              return (
                <div 
                  key={idx}
                  className={`quiz-option ${stateClass} ${selectedAnswer === idx ? 'selected' : ''}`}
                  onClick={() => handleSelectAnswer(idx)}
                >
                  <span className="option-bullet">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>

          {isAnswered && (
            <div className="quiz-explanation">
              <strong>💡 Explanation:</strong> {current.explanation}
              <div style={{ marginTop: '12px' }}>
                <button className="btn btn-sm btn-primary" onClick={handleNext}>
                  {currentQ + 1 === questions.length ? 'View Final Results' : 'Next Question →'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="quiz-result-view">
          <div className="result-score-circle">
            <span className="result-percent">{Math.round((score / questions.length) * 100)}%</span>
            <span className="result-label">{score} / {questions.length} Correct</span>
          </div>
          <h4>{score === questions.length ? '🌟 Exceptional Job! You are Ready!' : '👍 Good Effort! Review the weak areas and try again.'}</h4>
          <p>You have demonstrated strong foundational understanding of communication strategies and interview expectations.</p>
          <button className="btn btn-primary btn-sm" onClick={handleRestart} style={{ marginTop: '16px' }}>
            🔄 Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
