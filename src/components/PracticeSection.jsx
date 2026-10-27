import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function PracticeSection({ onNotify }) {
  const { questions, addSubmission, submissions, mySubmissionIds, refreshSubmissions, isFirebaseConnected } = useData();
  const [openId, setOpenId] = useState(questions[0]?.id ?? null);
  // Câu hỏi đang được trả lời (giữ nguyên kể cả khi đóng accordion)
  const [selectedId, setSelectedId] = useState(questions[0]?.id ?? null);
  const [studentName, setStudentName] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sentToInstructor, setSentToInstructor] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeQuestion = questions.find((q) => q.id === selectedId) || questions[0];
  const wordsCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const mySubmissions = submissions.filter((s) => mySubmissionIds.includes(s.id));

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
    setSelectedId(id);
  };

  const handleRefreshFeedback = async () => {
    setRefreshing(true);
    const ok = await refreshSubmissions();
    setRefreshing(false);
    onNotify(ok ? 'Đã cập nhật nhận xét mới nhất từ giảng viên.' : 'Không tải được dữ liệu, vui lòng thử lại.');
  };

  const handleStartSession = () => {
    const textarea = document.getElementById('practiceInput');
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textarea.focus();
      onNotify('Ready! Select a question or start drafting your answer.');
    }
  };

  const handleSubmitAnswer = () => {
    if (!answerText.trim()) {
      onNotify('Vui lòng nhập câu trả lời trước khi gửi.');
      return;
    }

    setAnalyzing(true);
    setSentToInstructor(false);

    // Chụp lại dữ liệu tại thời điểm bấm gửi
    const submittedText = answerText.trim();
    const submittedWords = wordsCount;
    const submittedTitle = activeQuestion?.title || 'General Question';
    const submittedName = studentName.trim() || 'Học viên ẩn danh';

    setTimeout(async () => {
      let analysis = '';
      if (submittedWords < 20) {
        analysis = '💡 Good concise start! However, in an interview, aim for 60-120 words to give the interviewer enough concrete context and measurable results.';
      } else if (submittedWords < 80) {
        analysis = '✨ Strong response structure! You hit key highlights smoothly. To elevate it further, ensure you end with how your strengths solve this team’s specific priorities.';
      } else {
        analysis = '🎯 Excellent depth and detail! Your response shows authentic expertise and solid communication clarity. Consider pausing after your main accomplishment for impact.';
      }

      setFeedback(analysis);

      // Tự động lưu bài làm và gửi vào hệ thống cho Admin / Giảng viên chấm
      const synced = await addSubmission({
        studentName: submittedName,
        questionTitle: submittedTitle,
        answerText: submittedText,
        wordsCount: submittedWords,
        aiFeedback: analysis
      });

      setAnalyzing(false);
      setAnswerText(''); // tránh bấm gửi trùng cùng một bài
      setSentToInstructor(true);
      onNotify(
        isFirebaseConnected && !synced
          ? '⚠️ Bài làm đã lưu trên máy bạn nhưng chưa gửi được lên hệ thống. Vui lòng thử lại.'
          : 'Đã phân tích AI và gửi bài làm tới hệ thống đánh giá thành công!'
      );
    }, 600);
  };

  return (
    <section className="practice-section" id="practice">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">INTERACTIVE DRILLS</span>
          <h2 className="section-title">Put Your Skills into Practice</h2>
          <p className="section-desc">
            Practice answering real-world interview prompts. Click each question to expand sample answers and record or type your own response.
          </p>
          <div className="section-cta-header">
            <button className="btn btn-primary btn-sm" onClick={handleStartSession}>
              Start Practice Session
            </button>
          </div>
        </div>

        <div className="practice-grid">
          {/* Left Column: Questions Accordion & Practice Box */}
          <div className="practice-left">
            <div className="accordion-group">
              {questions.map((q) => {
                const isOpen = openId === q.id;
                return (
                  <div className={`accordion-item ${isOpen ? 'open' : ''}`} key={q.id}>
                    <button 
                      className="accordion-header" 
                      onClick={() => toggleAccordion(q.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="accordion-q-title">
                        {q.category && <span className="q-category-tag">{q.category}</span>}
                        {q.title}
                      </span>
                      <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="accordion-body">
                        <p>
                          <strong>Sample Answer Framework:</strong> {q.body}
                        </p>
                        <a href="#practice" className="breakdown-link">Read full answer breakdown & tips →</a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive Practice Box */}
            <div className="practice-box">
              <label htmlFor="practiceInput" className="practice-box-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Type or record your answer for: <em>"{activeQuestion?.title}"</em>
              </label>

              {/* Student Name / Identifier Input */}
              <div className="practice-user-row">
                <input 
                  type="text"
                  className="practice-student-input"
                  placeholder="Họ tên hoặc Email của bạn (để nhận đánh giá từ giảng viên)..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <textarea 
                id="practiceInput" 
                className="practice-textarea" 
                placeholder="Type your draft answer here or practice aloud using the STAR method..."
                rows="4"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />

              <div className="practice-box-footer">
                <span className="word-count">
                  Word count: {wordsCount} word{wordsCount === 1 ? '' : 's'}
                </span>
                <button 
                  className="btn btn-dark btn-sm"
                  onClick={handleSubmitAnswer}
                  disabled={analyzing}
                >
                  {analyzing ? 'Đang gửi & phân tích...' : 'Submit & Gửi Nhận Xét'}
                </button>
              </div>

              {feedback && (
                <div className="ai-feedback-box">
                  <div className="feedback-badge">✨ Phản Hồi Trực Tuyến Từ Hệ Thống</div>
                  <p>{feedback}</p>
                  {sentToInstructor && (
                    <div className="submission-sent-badge">
                      <span>📬 Bài nộp đã được gửi lên hệ thống giảng viên! Giảng viên sẽ xem lại và gửi thêm nhận xét cho bạn.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="practice-box-hint">
                <span className="sparkle">💡</span> Instant feedback on clarity, structure, and tone will be provided, and your response is saved for instructor review.
              </div>
            </div>

            {/* Bài nộp của tôi + nhận xét của giảng viên */}
            {mySubmissions.length > 0 && (
              <div className="practice-box" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="practice-box-title" style={{ margin: 0 }}>📬 Bài nộp của tôi ({mySubmissions.length})</span>
                  {isFirebaseConnected && (
                    <button className="btn btn-sm btn-dark" onClick={handleRefreshFeedback} disabled={refreshing}>
                      {refreshing ? 'Đang tải...' : '🔄 Xem nhận xét mới'}
                    </button>
                  )}
                </div>
                {mySubmissions.map((s) => (
                  <div key={s.id} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {s.createdAt} • {s.status === 'Reviewed' ? '✓ Đã có nhận xét' : '⏳ Đang chờ giảng viên nhận xét'}
                    </div>
                    <strong style={{ display: 'block', margin: '4px 0' }}>{s.questionTitle}</strong>
                    <p style={{ fontSize: '0.9rem', margin: '4px 0', fontStyle: 'italic' }}>"{s.answerText}"</p>
                    {s.adminFeedback && (
                      <div className="ai-feedback-box" style={{ marginTop: '8px' }}>
                        <div className="feedback-badge">👨‍🏫 Nhận xét của giảng viên</div>
                        <p>{s.adminFeedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Card with Photo & Practice Tip */}
          <div className="practice-right">
            <div className="tip-card">
              <div className="tip-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" 
                  alt="Professional mock interview practice session" 
                  className="tip-img"
                />
              </div>
              <div className="tip-content">
                <span className="tip-tag">PRACTICE TIP OF THE DAY</span>
                <p className="tip-description">
                  Always structure answers using the <strong>STAR method</strong> (Situation, Task, Action, Result) to keep your answers crisp and impactful.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
