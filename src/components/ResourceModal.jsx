import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1Yzk-C6nLu1_KafmlhTyn6PaJgNEe4VMr?usp=sharing';
const GEMINI_FLASHCARD_SHARE_URL = 'https://share.gemini.google/Ci6wK6dFF2yLcasi';
const GEMINI_FLASHCARD_DIRECT_URL = 'https://gemini.google.com/share/Ci6wK6dFF2yLcasi';

export default function ResourceModal({ activeModal, onClose }) {
  // Close on Escape key
  // (Hook phải được gọi TRƯỚC mọi lệnh return sớm, nếu không React sẽ báo lỗi khi mở popup)
  useEffect(() => {
    if (!activeModal) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, onClose]);

  if (!activeModal) return null;

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

// Helper to extract embed url for YouTube (including Shorts, m.youtube.com, youtu.be) / Vimeo
function getEmbedVideoUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
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
  const [selectedId, setSelectedId] = useState(() => videos[0]?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('playlist');

  const selectedVideo = videos.find((v) => v.id === selectedId) || videos[0] || null;
  const embedUrl = selectedVideo?.videoUrl ? getEmbedVideoUrl(selectedVideo.videoUrl) : null;
  const isDirectVideo = selectedVideo?.videoUrl && /\.(mp4|webm|ogg)(\?|#|$)/i.test(selectedVideo.videoUrl);

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">BITE-SIZED VIDEO LESSON</span>
        <h3 className="modal-title">{selectedVideo?.title || 'Instructional Video Lesson'}</h3>
        <p className="modal-subtitle">
          Instructor: {selectedVideo?.instructor || 'WorkReady Talent Team'}
          {selectedVideo?.videoUrl && (
            <>
              {' • '}
              <a
                href={selectedVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}
              >
                Mở trên YouTube ↗
              </a>
            </>
          )}
        </p>
      </div>

      <div className="video-player-wrapper">
        {embedUrl ? (
          <div className="video-embed-container">
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={selectedVideo?.title || 'Video Player'}
              className="video-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : isDirectVideo ? (
          <video
            key={selectedVideo.videoUrl}
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
            Key Takeaways &amp; Notes
          </button>
        </div>

        {activeTab === 'playlist' ? (
          <div className="playlist-list">
            {videos.map((item) => (
              <div
                className={`playlist-item ${selectedVideo?.id === item.id ? 'active' : ''}`}
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
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
              <span className="timestamp">Key Point</span>
              <p><strong>Overview:</strong> {selectedVideo?.summary || 'Focus on value proposition and clarity.'}</p>
            </div>
            <div className="transcript-line">
              <span className="timestamp">Tip 1</span>
              <p><strong>Clear Structure:</strong> Use Present, Past, and Future or the STAR method so the interviewer can follow your story easily.</p>
            </div>
            <div className="transcript-line">
              <span className="timestamp">Tip 2</span>
              <p><strong>Body Language &amp; Delivery:</strong> Sit upright, maintain natural eye contact, smile, and speak at a calm, steady pace.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. COMPREHENSIVE GUIDES MODAL (With real PDF downloads & Google Drive folder)
function GuidesModal() {
  const [downloadMsg, setDownloadMsg] = useState('');

  const guides = [
    {
      id: 1,
      title: 'Interview Guide — How to Succeed in an English Job Interview (HUFLIT)',
      type: 'PDF Comprehensive Guide • 8 Pages',
      size: '25 KB',
      pdfUrl: '/pdfs/Interview_Guide_HUFLIT.pdf',
      driveUrl: 'https://drive.google.com/file/d/1ijWa3Uqxsg6MeQd_jSBi-HVtbghhlkS5/view?usp=sharing',
      description: 'Complete 3-stage roadmap (Before, During, After the interview), STAR method, thank-you & follow-up email templates, 7-day preparation plan, and special notes for HUFLIT students.'
    },
    {
      id: 2,
      title: 'Sample Interview Answers — 5 Common Interview Questions',
      type: 'PDF Practice Workbook • 8 Pages',
      size: '89 KB',
      pdfUrl: '/pdfs/Sample_Interview_Answers.pdf',
      driveUrl: 'https://drive.google.com/file/d/18_kgvxeczo9DKrmYqSVj988FmlkupRLT/view?usp=sharing',
      description: 'Step-by-step answer structures, full model responses, useful expressions, and fill-in sentence starters for the 5 most frequently asked interview questions.'
    },
    {
      id: 3,
      title: 'Professional Expressions for Interview (Commercial English)',
      type: 'PDF Bilingual Reference • 5 Pages',
      size: '92 KB',
      pdfUrl: '/pdfs/Professional_Expressions_Interview.pdf',
      driveUrl: 'https://drive.google.com/file/d/1_QfO_9NpBNVUXKxpUFxYVApc8cGfgPzi/view?usp=sharing',
      description: '12 customizable sentence patterns with Vietnamese meanings and real examples across Self-Introduction, Presenting Skills, Discussing Experience, and Asking the Interviewer.'
    },
    {
      id: 4,
      title: 'Interactive Vocabulary Drills (Matching, Fill-in-the-Blanks & MCQ)',
      type: 'PDF Exercise Workbook • 5 Pages',
      size: '57 KB',
      pdfUrl: '/pdfs/Interactive_Vocabulary_Drills.pdf',
      driveUrl: 'https://drive.google.com/file/d/1-PpPfhf4WxyDclLud4muZsG4CgRe8TN2/view?usp=sharing',
      description: 'Core recruitment & HR vocabulary workbook (Candidate, Recruiter, Assessment Center, Job Description, Interview) with full Answer Key & Explanations.'
    },
    {
      id: 5,
      title: 'Tough Interview Questions & High-EQ Answers (The STAR-E Formula)',
      type: 'PDF Case Study Book • 10 Pages',
      size: '69 KB',
      pdfUrl: '/pdfs/High_EQ_Interview_Answers.pdf',
      driveUrl: 'https://drive.google.com/file/d/1D3g5J9Ha537GO3Qvrn1_RcUCUhtKIS3A/view?usp=sharing',
      description: '9 challenging workplace scenarios across Teaching & Education, Event Management, and Office & Corporate roles solved with the STAR-E (Empathy/Learning) formula.'
    }
  ];

  const notifyDownload = (title) => {
    setDownloadMsg(`Đang tải "${title}"...`);
    setTimeout(() => setDownloadMsg(''), 3000);
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">DOWNLOADABLE PDF GUIDES &amp; SAMPLE DOCUMENTS</span>
        <h3 className="modal-title">Comprehensive Guides &amp; Sample Documents</h3>
        <p className="modal-subtitle">
          Tải trực tiếp từng file PDF về máy hoặc mở toàn bộ thư mục tài liệu trên Google Drive.
        </p>
      </div>

      {/* Banner mở thư mục Google Drive */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 18px',
          marginBottom: '16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '12px'
        }}
      >
        <div>
          <strong style={{ color: '#0369a1', display: 'block', fontSize: '0.95rem' }}>
            📂 Thư mục Google Drive — Trọn bộ 5 tài liệu PDF gốc
          </strong>
          <span style={{ fontSize: '0.84rem', color: '#475569' }}>
            Xem trước hoặc tải toàn bộ tài liệu PDF chuẩn bị phỏng vấn trên Google Drive.
          </span>
        </div>
        <a
          href={GOOGLE_DRIVE_FOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-primary"
          style={{ textDecoration: 'none' }}
        >
          ☁️ Mở Thư Mục PDF (Google Drive) ↗
        </a>
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

            <div className="guide-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={g.pdfUrl}
                download
                className="btn btn-sm btn-primary"
                style={{ textDecoration: 'none' }}
                onClick={() => notifyDownload(g.title)}
              >
                📥 Tải file PDF
              </a>
              <a
                href={g.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-dark"
                style={{ textDecoration: 'none' }}
              >
                👁️ Xem trực tiếp PDF
              </a>
              <a
                href={g.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{ textDecoration: 'none', border: '1px solid #cbd5e1', color: '#334155', background: '#fff' }}
              >
                ☁️ Xem trên Drive ↗
              </a>
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
      term: 'Candidate',
      phonetic: '/ˈkændɪdət/ • Ứng viên',
      meaning: 'A person who formally applies for an open job position and takes part in the selection process.',
      example: '"Each candidate was asked to complete a group problem-solving task during the multi-stage evaluation."'
    },
    {
      term: 'Recruiter',
      phonetic: '/rɪˈkruːtər/ • Chuyên viên tuyển dụng',
      meaning: 'A professional whose job is to find, screen, interview, and attract talent for an organization.',
      example: '"The HR recruiter reviewed dozens of resumes before selecting the top five applicants for the initial screening."'
    },
    {
      term: 'Assessment Center',
      phonetic: '/əˈsɛsmənt ˈsɛntər/ • Trung tâm đánh giá năng lực',
      meaning: 'A process to evaluate candidates through structured activities, role-plays, group discussions, and case studies.',
      example: '"Major corporations often utilize an assessment center to observe how applicants handle pressure and teamwork in real-world scenarios."'
    },
    {
      term: 'Job Description (JD)',
      phonetic: '/dʒɒb dɪˈskrɪpʃn/ • Bản mô tả công việc',
      meaning: 'An official outline of duties, responsibilities, reporting lines, and qualifications required for a position.',
      example: '"Before submitting your application, make sure to read the job description carefully to understand the required qualifications."'
    },
    {
      term: 'Interview',
      phonetic: '/ˈɪntərvjuː/ • Buổi phỏng vấn',
      meaning: 'A formal meeting (in-person or online) to assess a candidate’s ability, communication skills, and suitability for a role.',
      example: '"She felt nervous before attending her first face-to-face interview with the hiring manager."'
    },
    {
      term: 'The STAR-E Formula',
      phonetic: 'Situation • Task • Action • Result • Empathy/Learning',
      meaning: 'An upgraded behavioral answer framework that adds Empathy & Learning to show high emotional intelligence (High-EQ) in tough workplace scenarios.',
      example: '"Always begin by acknowledging the other person’s feelings (Empathy) and aim for a balanced Win–Win Result."'
    },
    {
      term: 'Self-Introduction Pattern',
      phonetic: 'Mẫu câu Giới thiệu bản thân • Commercial English',
      meaning: 'Pattern: "I am a [Job Title] with a strong background in [Specialization], focusing on [Core Area]." (Tôi là [Chức danh] với nền tảng vững chắc về [Chuyên môn], tập trung vào [Lĩnh vực cốt lõi].)',
      example: '"I am an English Language graduate with a strong background in commercial translation, focusing on corporate communications and international business correspondence."'
    },
    {
      term: 'Presenting Core Strengths',
      phonetic: 'Mẫu câu Trình bày thế mạnh • Commercial English',
      meaning: 'Pattern: "One of my core strengths is [Skill], particularly in [Specific Aspect]." (Một trong những thế mạnh cốt lõi của tôi là [Kỹ năng], đặc biệt là trong [Khía cạnh cụ thể].)',
      example: '"One of my core strengths is English editing and proofreading, particularly in ensuring formal tone and accurate terminology for legal and commercial contracts."'
    },
    {
      term: 'Highlighting Proactive Initiative',
      phonetic: 'Mẫu câu Nói về kinh nghiệm & kết quả • Commercial English',
      meaning: 'Pattern: "I took the initiative to [Proactive Action], which resulted in [Positive Outcome]." (Tôi đã chủ động [Hành động], điều này dẫn đến [Kết quả tích cực].)',
      example: '"I took the initiative to build a comprehensive bilingual glossary for the support team, which reduced customer query resolution time by 20%."'
    },
    {
      term: 'Asking the Interviewer',
      phonetic: 'Mẫu câu Đặt câu hỏi cho nhà tuyển dụng • Commercial English',
      meaning: 'Pattern: "Could you elaborate on how [Metric A] and [Metric B] are evaluated in this role?" (Anh/Chị có thể chia sẻ chi tiết hơn về cách đánh giá [Tiêu chí A] và [Tiêu chí B] ở vị trí này không?)',
      example: '"Could you elaborate on how language accuracy and turnaround time are balanced when evaluating translation quality in this role?"'
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
        <span className="modal-badge">VOCABULARY &amp; PHRASING DRILL</span>
        <h3 className="modal-title">Interactive Terminology Flashcards</h3>
        <p className="modal-subtitle">
          Luyện từ vựng &amp; mẫu câu phỏng vấn ngay bên dưới, hoặc mở bộ Flashcard tương tác trên Gemini.
        </p>
      </div>

      {/* Liên kết mở bộ Flashcard Gemini & tải PDF Vocabulary Drills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '12px 16px',
          marginBottom: '14px',
          background: '#eef2ff',
          border: '1px solid #c7d2fe',
          borderRadius: '12px'
        }}
      >
        <div style={{ fontSize: '0.86rem', color: '#1e1b4b' }}>
          <strong>✨ Bộ Flashcard &amp; Bài tập Từ vựng mở rộng:</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href={GEMINI_FLASHCARD_DIRECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary"
            style={{ textDecoration: 'none' }}
            title={GEMINI_FLASHCARD_SHARE_URL}
          >
            🚀 Mở Flashcard trên Gemini ↗
          </a>
          <a
            href="/pdfs/Interactive_Vocabulary_Drills.pdf"
            download
            className="btn btn-sm btn-dark"
            style={{ textDecoration: 'none' }}
          >
            📥 Tải PDF Vocabulary Drills
          </a>
        </div>
      </div>

      <div className="flashcard-status-bar">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className="mastered-tag">Mastered: {masteredCount}</span>
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        {!flipped ? (
          <div className="flashcard-front">
            <div className="flashcard-chip">TERM / PATTERN</div>
            <h2 className="flashcard-term">{current.term}</h2>
            <div className="flashcard-phonetic">{current.phonetic}</div>
            <button
              className="audio-btn"
              onClick={(e) => { e.stopPropagation(); speakTerm(current.term); }}
              title="Pronounce in English"
            >
              🔊 Listen Pronunciation
            </button>
            <span className="flip-hint">👆 Click to flip &amp; view meaning + example</span>
          </div>
        ) : (
          <div className="flashcard-back">
            <div className="flashcard-chip chip-back">EXPLANATION &amp; INTERVIEW USAGE</div>
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

// 4. CASE SAMPLES FOR PROBLEM SOLVING MODAL (High-EQ Interview Answers - STAR-E Formula)
function CaseStudyModal() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const scenarios = [
    {
      category: 'Teaching & Education • Scenario 1',
      title: 'Angry Parent Complains About Grades',
      context: 'If an angry parent contacts you, claiming your grading is unfair and demanding you change their child’s final mark, how would you handle it?',
      options: [
        {
          id: 'A',
          text: 'Argue back immediately to defend your grading authority and refuse to discuss the exam paper.',
          correct: false,
          feedback: '❌ Low-EQ Response: Arguing when emotions are high escalates conflict. Rule 1 is to separate people from the problem.'
        },
        {
          id: 'B',
          text: 'Listen actively without interrupting, validate their concern for their child, neutrally walk through the grading rubric and student’s work, then shift to a joint action plan to help the student improve.',
          correct: true,
          feedback: '✅ High-EQ Answer (STAR-E Formula): "I would listen actively without interrupting, validating their concern because it comes from caring for their child. Once they feel heard, I’d objectively walk them through the grading rubrics and shift to a joint plan to help the student improve."'
        },
        {
          id: 'C',
          text: 'Immediately raise the student’s grade just to make the parent stop complaining.',
          correct: false,
          feedback: '⚠️ Unfair Practice: Changing marks without academic justification compromises fairness and institutional integrity.'
        }
      ]
    },
    {
      category: 'Event Management • Scenario 2',
      title: 'Keynote Speaker Cancels 30 Minutes Before Live Event',
      context: 'It is 30 minutes before a major live event and your keynote speaker calls to cancel due to an emergency. What do you do?',
      options: [
        {
          id: 'A',
          text: 'Remain calm to reassure the team, immediately activate Plan B (swap agenda slots or have a senior panelist step in), or turn the slot into an interactive Q&A/networking session while gracefully informing attendees.',
          correct: true,
          feedback: '✅ High-EQ Answer (STAR-E Formula): "First, I remain calm because the team feeds off my energy. I immediately check our backup plan: swap agenda slots or have a senior panelist step in, or turn the session into an interactive Q&A while gracefully informing attendees."'
        },
        {
          id: 'B',
          text: 'Panic in front of the staff and cancel the entire event immediately.',
          correct: false,
          feedback: '❌ Poor Crisis Management: Leaders must stay composed because the team feeds off your energy.'
        },
        {
          id: 'C',
          text: 'Say nothing to the audience and leave the stage empty for 45 minutes.',
          correct: false,
          feedback: '⚠️ Unprofessional: Leaving attendees in the dark damages trust and event credibility.'
        }
      ]
    },
    {
      category: 'Office & Corporate • Scenario 3',
      title: 'Colleague From Another Team Misses Deadlines',
      context: 'You are leading a cross-functional project, but a colleague from another team refuses to deliver their part on time. What do you do?',
      options: [
        {
          id: 'A',
          text: 'Send a public, critical email copying senior management to blame the colleague.',
          correct: false,
          feedback: '❌ Damaging to Teamwork: Publicly shaming a coworker puts them on the defensive and ruins cross-functional trust.'
        },
        {
          id: 'B',
          text: 'Schedule a private 1-on-1 to listen to their bottlenecks, explain how their deliverable impacts shared goals, and collaborate to simplify the process or adjust timelines before escalating.',
          correct: true,
          feedback: '✅ High-EQ Answer (STAR-E Formula): "I’d schedule a private 1-on-1 to understand their roadblocks: \'Is there anything blocking you on this task?\' I reframe how their deliverable impacts the big picture and explore how to simplify the task together."'
        },
        {
          id: 'C',
          text: 'Ignore their missing part and submit an incomplete project without telling anyone.',
          correct: false,
          feedback: '⚠️ Passive Approach: Failing to address bottlenecks early puts the entire project at risk.'
        }
      ]
    }
  ];

  const scenario = scenarios[scenarioIdx];

  const handleSelect = (id) => {
    setSelectedOption(id);
    setSubmitted(true);
  };

  const handleSwitchScenario = (idx) => {
    setScenarioIdx(idx);
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <span className="modal-badge">HIGH-EQ WORKPLACE CASE STUDIES (STAR-E FORMULA)</span>
        <h3 className="modal-title">{scenario.title}</h3>
        <p className="modal-subtitle">
          {scenario.category} •{' '}
          <a href="/pdfs/High_EQ_Interview_Answers.pdf" download style={{ color: '#0284c7', fontWeight: 600 }}>
            📥 Tải trọn bộ 9 tình huống High-EQ (PDF)
          </a>
        </p>
      </div>

      <div className="modal-tabs" style={{ marginBottom: '14px' }}>
        {scenarios.map((s, idx) => (
          <button
            key={idx}
            className={`modal-tab-btn ${scenarioIdx === idx ? 'active' : ''}`}
            onClick={() => handleSwitchScenario(idx)}
          >
            Case {idx + 1}: {s.category.split('•')[0].trim()}
          </button>
        ))}
      </div>

      <div className="case-context-box">
        <span className="case-badge">INTERVIEW QUESTION</span>
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
          <p>{scenario.options.find((o) => o.id === selectedOption)?.feedback}</p>
          <button
            className="btn btn-sm btn-dark"
            onClick={() => handleSwitchScenario((scenarioIdx + 1) % scenarios.length)}
            style={{ marginTop: '10px' }}
          >
            Next Case Study →
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
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ((prev) => prev + 1);
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
