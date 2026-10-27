import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { getFirebaseConfig, saveFirebaseConfig, initFirebase, isFirebaseConfiguredByEnv } from '../services/firebase';

// Mật khẩu admin lấy từ biến môi trường VITE_ADMIN_PASSWORD (đặt trên Vercel / file .env).
// Lưu ý: đây chỉ là lớp che chắn phía trình duyệt, không phải bảo mật thật sự.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export default function AdminPanel({ onClose }) {
  const {
    questions,
    videos,
    tasks,
    quizzes,
    submissions,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    isFirebaseConnected,
    setIsFirebaseConnected,
    loadFromCloud,
    pushAllToCloud,
    refreshSubmissions,
    addQuestion,
    deleteQuestion,
    addVideo,
    deleteVideo,
    addTask,
    deleteTask,
    toggleTask,
    addQuiz,
    deleteQuiz,
    updateSubmissionFeedback,
    deleteSubmission,
    exportAllData,
    importAllData,
    resetAllData
  } = useData();

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'questions' | 'videos' | 'tasks' | 'quizzes' | 'backup'
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        {/* If Not Authenticated, show Login Screen */}
        {!isAdminAuthenticated ? (
          <div className="admin-login-card">
            <div className="login-icon-box">🔐</div>
            <h3 className="login-title">Cổng Quản Trị Bảo Mật</h3>
            <p className="login-desc">
              Khu vực quản trị đã được ẩn khỏi giao diện công khai. Vui lòng nhập mã bảo mật để tiếp tục.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <input
                type="password"
                className="admin-input login-input"
                placeholder="Nhập mật khẩu quản trị..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
              {authError && <div className="login-error-text">{authError}</div>}

              <div className="login-actions">
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Đăng Nhập Quản Trị
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Authenticated Admin Header */}
            <div className="admin-header">
              <div className="admin-title-row">
                <div className="admin-badge">
                  <span className="admin-dot"></span>
                  BẢNG QUẢN TRỊ VIÊN
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="btn btn-sm btn-logout"
                    onClick={() => setIsAdminAuthenticated(false)}
                    title="Đăng xuất"
                  >
                    Đăng xuất
                  </button>
                  <button className="admin-close-btn" onClick={onClose} aria-label="Close admin">
                    &times;
                  </button>
                </div>
              </div>
              <h2 className="admin-heading">Quản Trị Hệ Thống & Lưu Trữ Dữ Liệu</h2>
              <p className="admin-subheading">
                Xem bài nộp học viên, quản lý video YouTube/MP4 thật, bài tập và cấu hình lưu trữ Firebase Cloud.
              </p>

              {/* Navigation Tabs */}
              <div className="admin-tabs">
                <button
                  className={`admin-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('submissions')}
                >
                  📬 Bài Nộp & Feedback ({submissions.length})
                </button>
                <button
                  className={`admin-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('questions')}
                >
                  📌 Câu Hỏi ({questions.length})
                </button>
                <button
                  className={`admin-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('videos')}
                >
                  🎬 Video Bài Giảng ({videos.length})
                </button>
                <button
                  className={`admin-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  🎯 Nhiệm Vụ ({tasks.length})
                </button>
                <button
                  className={`admin-tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quizzes')}
                >
                  📝 Trắc Nghiệm ({quizzes.length})
                </button>
                <button
                  className={`admin-tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
                  onClick={() => setActiveTab('backup')}
                >
                  ☁️ Sao Lưu & Firebase {isFirebaseConnected ? '🟢' : '🟡'}
                </button>
              </div>
            </div>

            {successMsg && <div className="admin-alert-success">{successMsg}</div>}

            {/* Tab Contents */}
            <div className="admin-body">
              {activeTab === 'submissions' && (
                <SubmissionsManager
                  submissions={submissions}
                  isFirebaseConnected={isFirebaseConnected}
                  onRefresh={async () => {
                    const ok = await refreshSubmissions();
                    triggerSuccess(ok ? 'Đã tải bài nộp mới nhất từ Firebase.' : 'Không tải được dữ liệu từ Firebase.');
                  }}
                  onUpdateFeedback={async (id, feedback) => {
                    const synced = await updateSubmissionFeedback(id, feedback);
                    triggerSuccess(
                      isFirebaseConnected && !synced
                        ? '⚠️ Đã lưu trên máy này nhưng KHÔNG đồng bộ được lên Firebase (kiểm tra Firestore Rules).'
                        : 'Đã gửi nhận xét phản hồi cho học viên thành công!'
                    );
                  }}
                  onDelete={(id) => {
                    deleteSubmission(id);
                    triggerSuccess('Đã xóa bài nộp.');
                  }}
                />
              )}

              {activeTab === 'questions' && (
                <QuestionsManager
                  questions={questions}
                  onAdd={(q) => {
                    addQuestion(q);
                    triggerSuccess('Đã thêm câu hỏi phỏng vấn mới thành công!');
                  }}
                  onDelete={(id) => {
                    deleteQuestion(id);
                    triggerSuccess('Đã xóa câu hỏi phỏng vấn.');
                  }}
                />
              )}

              {activeTab === 'videos' && (
                <VideosManager
                  videos={videos}
                  onAdd={(v) => {
                    addVideo(v);
                    triggerSuccess('Đã thêm video bài giảng mới thành công!');
                  }}
                  onDelete={(id) => {
                    deleteVideo(id);
                    triggerSuccess('Đã xóa video bài giảng.');
                  }}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksManager
                  tasks={tasks}
                  onAdd={(t) => {
                    addTask(t);
                    triggerSuccess('Đã giao nhiệm vụ mới cho học viên!');
                  }}
                  onToggle={toggleTask}
                  onDelete={(id) => {
                    deleteTask(id);
                    triggerSuccess('Đã xóa nhiệm vụ.');
                  }}
                />
              )}

              {activeTab === 'quizzes' && (
                <QuizzesManager
                  quizzes={quizzes}
                  onAdd={(qz) => {
                    addQuiz(qz);
                    triggerSuccess('Đã thêm câu hỏi trắc nghiệm mới thành công!');
                  }}
                  onDelete={(id) => {
                    deleteQuiz(id);
                    triggerSuccess('Đã xóa câu hỏi trắc nghiệm.');
                  }}
                />
              )}

              {activeTab === 'backup' && (
                <CloudBackupManager
                  onExport={() => {
                    exportAllData();
                    triggerSuccess('Đã xuất file sao lưu JSON thành công!');
                  }}
                  onImport={(json) => {
                    const ok = importAllData(json);
                    if (ok) triggerSuccess('Đã nhập và khôi phục toàn bộ dữ liệu thành công!');
                    else triggerSuccess('Lỗi: File JSON không đúng định dạng!');
                  }}
                  isFirebaseConnected={isFirebaseConnected}
                  onConnectFirebase={async (connected) => {
                    setIsFirebaseConnected(connected);
                    if (connected) {
                      // Đẩy dữ liệu hiện có lên cloud rồi tải lại bản chung từ cloud
                      await pushAllToCloud();
                      const ok = await loadFromCloud();
                      triggerSuccess(ok
                        ? 'Đã kết nối và đồng bộ dữ liệu với Firebase Firestore!'
                        : '⚠️ Đã lưu cấu hình nhưng không đọc được Firestore. Kiểm tra lại cấu hình / Firestore Rules.');
                    } else {
                      triggerSuccess('Đã ngắt kết nối Firebase.');
                    }
                  }}
                />
              )}
            </div>

            {/* Admin Footer */}
            <div className="admin-footer">
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ về dữ liệu mẫu ban đầu không?')) {
                    resetAllData();
                    triggerSuccess('Đã khôi phục dữ liệu gốc!');
                  }
                }}
              >
                🔄 Khôi Phục Dữ Liệu Gốc
              </button>
              <button className="btn btn-sm btn-dark" onClick={onClose}>
                Đóng Bảng Quản Trị
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 1. SUBMISSIONS & FEEDBACKS MANAGER
// ==========================================
function SubmissionsManager({ submissions, isFirebaseConnected, onRefresh, onUpdateFeedback, onDelete }) {
  const [feedbackDrafts, setFeedbackDrafts] = useState({});

  const handleDraftChange = (id, val) => {
    setFeedbackDrafts((prev) => ({ ...prev, [id]: val }));
  };

  const handleSendFeedback = (id) => {
    const feedbackText = feedbackDrafts[id];
    if (!feedbackText || !feedbackText.trim()) return;
    onUpdateFeedback(id, feedbackText.trim());
    setFeedbackDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="manager-container">
      <div className="submissions-intro-banner">
        <strong>📋 Danh Sách Bài Nộp & Đánh Giá Của Học Viên</strong>
        <p>
          Học viên gửi câu trả lời phỏng vấn từ mục <em>Put Your Skills into Practice</em> sẽ lập tức xuất hiện tại đây để bạn chấm điểm và gửi phản hồi nhận xét trực tiếp.
        </p>
        {isFirebaseConnected ? (
          <button className="btn btn-sm btn-dark" onClick={onRefresh} style={{ marginTop: '8px' }}>
            🔄 Tải bài nộp mới nhất
          </button>
        ) : (
          <p style={{ marginTop: '8px', color: '#b45309', fontWeight: 600 }}>
            ⚠️ Chưa kết nối Firebase: bạn chỉ thấy bài nộp được gửi từ chính trình duyệt này.
          </p>
        )}
      </div>

      <div className="admin-items-list">
        {submissions.length === 0 ? (
          <div className="empty-submissions">Chưa có bài nộp nào từ học viên.</div>
        ) : (
          submissions.map((sub) => (
            <div className="submission-card" key={sub.id}>
              <div className="submission-card-header">
                <div>
                  <span className={`status-pill ${sub.status === 'Reviewed' ? 'reviewed' : 'pending'}`}>
                    {sub.status === 'Reviewed' ? '✓ Đã nhận xét' : '⏳ Chờ nhận xét'}
                  </span>
                  <h4 className="sub-q-title">{sub.questionTitle}</h4>
                  <div className="sub-meta">
                    <strong>Học viên:</strong> {sub.studentName} • <strong>Thời gian:</strong> {sub.createdAt} • <strong>Độ dài:</strong> {sub.wordsCount} từ
                  </div>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(sub.id)}
                  title="Xóa bài nộp"
                >
                  🗑️ Xóa
                </button>
              </div>

              {/* Student's Answer */}
              <div className="student-answer-box">
                <span className="box-label">Câu trả lời của học viên:</span>
                <p className="answer-text">"{sub.answerText}"</p>
              </div>

              {/* AI Auto Review */}
              {sub.aiFeedback && (
                <div className="ai-review-sub-box">
                  <span className="box-label">🤖 Phản hồi tự động từ hệ thống AI:</span>
                  <p>{sub.aiFeedback}</p>
                </div>
              )}

              {/* Existing Instructor Feedback */}
              {sub.adminFeedback && (
                <div className="instructor-existing-feedback">
                  <span className="box-label">👨‍🏫 Nhận xét của giảng viên (Đã gửi):</span>
                  <p>{sub.adminFeedback}</p>
                </div>
              )}

              {/* Instructor Reply Input */}
              <div className="instructor-reply-box">
                <label className="box-label">
                  {sub.adminFeedback ? 'Cập nhật lại nhận xét của giảng viên:' : '✍️ Gửi nhận xét phản hồi cho học viên này:'}
                </label>
                <textarea
                  className="admin-textarea"
                  rows="2"
                  placeholder="Nhập lời khen, điểm cần cải thiện hoặc góp ý dùng từ phỏng vấn..."
                  value={feedbackDrafts[sub.id] !== undefined ? feedbackDrafts[sub.id] : (sub.adminFeedback || '')}
                  onChange={(e) => handleDraftChange(sub.id, e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleSendFeedback(sub.id)}
                  >
                    {sub.adminFeedback ? 'Cập Nhật Nhận Xét' : 'Gửi Nhận Xét'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. QUESTIONS MANAGER
// ==========================================
function QuestionsManager({ questions, onAdd, onDelete }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Behavioral');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onAdd({ title, category, body });
    setTitle('');
    setBody('');
  };

  return (
    <div className="manager-container">
      <div className="admin-card-form">
        <h4 className="form-title">➕ Thêm Câu Hỏi Luyện Tập Mới</h4>
        <form onSubmit={handleSubmit} className="admin-form-grid">
          <div className="form-group">
            <label>Tiêu đề câu hỏi phỏng vấn *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: How do you handle working with difficult team members?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phân loại (Category)</label>
            <select
              className="admin-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General / Chung</option>
              <option value="Behavioral">Behavioral / Hành vi (STAR)</option>
              <option value="Technical">Technical / Kỹ thuật</option>
              <option value="Motivation">Motivation / Động lực</option>
              <option value="Leadership">Leadership / Lãnh đạo</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Khung câu trả lời mẫu gợi ý (STAR Framework) *</label>
            <textarea
              className="admin-textarea"
              rows="3"
              placeholder="Gợi ý cấu trúc câu trả lời: Bối cảnh (S), Nhiệm vụ (T), Hành động cụ thể (A) và Kết quả đạt được (R)..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary btn-sm">
              Lưu Câu Hỏi Vào Hệ Thống
            </button>
          </div>
        </form>
      </div>

      <div className="admin-items-list">
        <h4 className="list-title">Danh sách câu hỏi hiện tại ({questions.length})</h4>
        {questions.map((q) => (
          <div className="admin-item-row" key={q.id}>
            <div className="admin-item-info">
              <span className="item-tag">{q.category || 'Interview'}</span>
              <h5 className="item-title">{q.title}</h5>
              <p className="item-desc">{q.body}</p>
            </div>
            <button
              className="btn-delete"
              onClick={() => onDelete(q.id)}
              title="Xóa câu hỏi này"
            >
              🗑️ Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. VIDEOS MANAGER (With YouTube/MP4 support)
// ==========================================
function VideosManager({ videos, onAdd, onDelete }) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('04:00');
  const [instructor, setInstructor] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title,
      duration,
      instructor: instructor || 'WorkReady Expert Coach',
      videoUrl: videoUrl.trim(),
      summary
    });
    setTitle('');
    setInstructor('');
    setVideoUrl('');
    setSummary('');
  };

  return (
    <div className="manager-container">
      <div className="admin-card-form">
        <h4 className="form-title">➕ Thêm Video Bài Giảng Mới</h4>
        <form onSubmit={handleSubmit} className="admin-form-grid">
          <div className="form-group">
            <label>Tên bài giảng video *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: Master Behavioral Interview in 5 Minutes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Thời lượng (mm:ss)</label>
            <input
              type="text"
              className="admin-input"
              placeholder="03:45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Link Video thật (YouTube hoặc link file MP4) 🎬</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: https://www.youtube.com/watch?v=... hoặc https://.../video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Giảng viên / Diễn giả</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: John Doe (Senior HR Manager)"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label>Tóm tắt bài học</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: Các quy tắc vàng khi thương lượng đãi ngộ..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary btn-sm">
              Đăng Video Lên Khóa Học
            </button>
          </div>
        </form>
      </div>

      <div className="admin-items-list">
        <h4 className="list-title">Danh sách bài học video ({videos.length})</h4>
        {videos.map((v) => (
          <div className="admin-item-row" key={v.id}>
            <div className="admin-item-info">
              <span className="item-tag video-tag">🎬 {v.duration}</span>
              <h5 className="item-title">{v.title}</h5>
              <p className="item-desc">
                <strong>Giảng viên:</strong> {v.instructor} • {v.summary}
              </p>
              {v.videoUrl && (
                <div style={{ marginTop: '4px' }}>
                  <a href={v.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#0284c7' }}>
                    🔗 Nguồn video: {v.videoUrl}
                  </a>
                </div>
              )}
            </div>
            <button
              className="btn-delete"
              onClick={() => onDelete(v.id)}
              title="Xóa video này"
            >
              🗑️ Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. TASKS & MISSIONS MANAGER
// ==========================================
function TasksManager({ tasks, onAdd, onToggle, onDelete }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Practice');
  const [points, setPoints] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title,
      category,
      points: Number(points) || 20
    });
    setTitle('');
  };

  return (
    <div className="manager-container">
      <div className="admin-card-form">
        <h4 className="form-title">➕ Giao Nhiệm Vụ Mới Cho Học Viên</h4>
        <form onSubmit={handleSubmit} className="admin-form-grid">
          <div className="form-group">
            <label>Tên nhiệm vụ / Mục tiêu học tập *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: Luyện tập trả lời câu hỏi STAR số 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phân loại nhiệm vụ</label>
            <select
              className="admin-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Practice">Thực hành phỏng vấn</option>
              <option value="Video">Xem bài học video</option>
              <option value="Vocabulary">Học flashcards từ vựng</option>
              <option value="Assessment">Kiểm tra trắc nghiệm</option>
            </select>
          </div>

          <div className="form-group">
            <label>Điểm thưởng hoàn thành (Points)</label>
            <input
              type="number"
              className="admin-input"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="10"
              max="200"
            />
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary btn-sm">
              Tạo Nhiệm Vụ Mới
            </button>
          </div>
        </form>
      </div>

      <div className="admin-items-list">
        <h4 className="list-title">Danh sách nhiệm vụ học viên ({tasks.length})</h4>
        {tasks.map((t) => (
          <div className={`admin-item-row task-row ${t.completed ? 'completed' : ''}`} key={t.id}>
            <div className="task-checkbox-col">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => onToggle(t.id)}
                title="Đánh dấu hoàn thành"
              />
            </div>
            <div className="admin-item-info">
              <span className="item-tag task-tag">{t.category} • +{t.points} pts</span>
              <h5 className={`item-title ${t.completed ? 'strike' : ''}`}>{t.title}</h5>
            </div>
            <button
              className="btn-delete"
              onClick={() => onDelete(t.id)}
              title="Xóa nhiệm vụ"
            >
              🗑️ Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. QUIZZES MANAGER
// ==========================================
function QuizzesManager({ quizzes, onAdd, onDelete }) {
  const [question, setQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [answerIndex, setAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !optA.trim() || !optB.trim()) return;

    // Giữ đúng vị trí đáp án sau khi bỏ các ô trống
    // (VD: điền A, B, D mà bỏ trống C thì D phải vẫn là đáp án đúng nếu được chọn)
    const raw = [optA, optB, optC, optD].map((o) => o.trim());
    const chosen = Number(answerIndex);
    if (!raw[chosen]) {
      alert(`Đáp án đúng bạn chọn (${String.fromCharCode(65 + chosen)}) đang để trống. Vui lòng điền nội dung hoặc chọn đáp án khác.`);
      return;
    }
    const options = raw.filter(Boolean);
    const mappedAnswerIndex = raw.slice(0, chosen).filter(Boolean).length;

    onAdd({
      question: question.trim(),
      options,
      answerIndex: mappedAnswerIndex,
      explanation: explanation || 'Đáp án chính xác theo tiêu chuẩn phỏng vấn hiện đại.'
    });
    setQuestion('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setAnswerIndex(0);
    setExplanation('');
  };

  return (
    <div className="manager-container">
      <div className="admin-card-form">
        <h4 className="form-title">➕ Thêm Câu Hỏi Trắc Nghiệm Mới</h4>
        <form onSubmit={handleSubmit} className="admin-form-grid">
          <div className="form-group full-width">
            <label>Nội dung câu hỏi *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: Khi người phỏng vấn hỏi về mức lương kỳ vọng, bạn nên làm gì?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Đáp án A *</label>
            <input
              type="text"
              className="admin-input"
              value={optA}
              onChange={(e) => setOptA(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Đáp án B *</label>
            <input
              type="text"
              className="admin-input"
              value={optB}
              onChange={(e) => setOptB(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Đáp án C</label>
            <input
              type="text"
              className="admin-input"
              value={optC}
              onChange={(e) => setOptC(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Đáp án D</label>
            <input
              type="text"
              className="admin-input"
              value={optD}
              onChange={(e) => setOptD(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Đáp án chính xác *</label>
            <select
              className="admin-input"
              value={answerIndex}
              onChange={(e) => setAnswerIndex(e.target.value)}
            >
              <option value={0}>Đáp án A</option>
              <option value={1}>Đáp án B</option>
              <option value={2}>Đáp án C</option>
              <option value={3}>Đáp án D</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giải thích chi tiết</label>
            <input
              type="text"
              className="admin-input"
              placeholder="Giải thích vì sao đáp án này được chuyên gia khuyên dùng..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary btn-sm">
              Lưu Câu Hỏi Trắc Nghiệm
            </button>
          </div>
        </form>
      </div>

      <div className="admin-items-list">
        <h4 className="list-title">Danh sách câu hỏi trắc nghiệm ({quizzes.length})</h4>
        {quizzes.map((qz, idx) => (
          <div className="admin-item-row" key={qz.id || idx}>
            <div className="admin-item-info">
              <span className="item-tag quiz-tag">Câu {idx + 1}</span>
              <h5 className="item-title">{qz.question}</h5>
              <div className="quiz-preview-options">
                {qz.options.map((opt, oIdx) => (
                  <span
                    key={oIdx}
                    className={`opt-pill ${oIdx === qz.answerIndex ? 'correct-opt' : ''}`}
                  >
                    {String.fromCharCode(65 + oIdx)}. {opt}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="btn-delete"
              onClick={() => onDelete(qz.id)}
              title="Xóa câu hỏi này"
            >
              🗑️ Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. CLOUD BACKUP & FIREBASE SETTINGS
// ==========================================
function CloudBackupManager({ onExport, onImport, isFirebaseConnected, onConnectFirebase }) {
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [configStatus, setConfigStatus] = useState('');

  // Tải config đã lưu nếu có
  React.useEffect(() => {
    const existing = getFirebaseConfig();
    if (existing) {
      setApiKey(existing.apiKey || '');
      setProjectId(existing.projectId || '');
      setAuthDomain(existing.authDomain || '');
      setStorageBucket(existing.storageBucket || '');
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onImport(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setConfigStatus('Vui lòng nhập ít nhất API Key và Project ID!');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`
    };

    saveFirebaseConfig(config);
    const db = initFirebase();
    if (db) {
      onConnectFirebase(true);
      setConfigStatus('✅ Đã kết nối Firebase Firestore thành công! Dữ liệu bài tập & bài nộp sẽ tự động đồng bộ lên đám mây.');
    } else {
      onConnectFirebase(false);
      setConfigStatus('⚠️ Không thể kết nối. Vui lòng kiểm tra lại cấu hình.');
    }
  };

  const handleDisconnect = () => {
    saveFirebaseConfig(null);
    onConnectFirebase(false);
    setApiKey('');
    setProjectId('');
    setAuthDomain('');
    setStorageBucket('');
    setConfigStatus('Đã ngắt kết nối Firebase. Hệ thống chuyển về chế độ lưu trữ cục bộ.');
  };

  return (
    <div className="manager-container">
      {/* Export / Import Box */}
      <div className="admin-card-form">
        <h4 className="form-title">📦 Sao Lưu & Chuyển Đổi Dữ Liệu (JSON Export / Import)</h4>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
          Bạn có thể tải toàn bộ bài tập, video, nhiệm vụ và bài nộp của học viên về máy tính dưới dạng file JSON để lưu trữ hoặc chuyển sang máy khác.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary btn-sm" onClick={onExport}>
            📥 Xuất File Dữ Liệu (Export Backup JSON)
          </button>

          <label className="btn btn-dark btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
            📤 Nhập File Dữ Liệu (Import JSON)
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Firebase Cloud Storage Box */}
      <div className="admin-card-form">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 className="form-title" style={{ margin: 0 }}>🔥 Kết Nối Firebase Cloud (Lưu bài tập trên đám mây)</h4>
          <span className={`status-pill ${isFirebaseConnected ? 'reviewed' : 'pending'}`}>
            {isFirebaseConnected ? '🟢 Đã kết nối Cloud Firestore' : '🟡 Đang lưu Offline / LocalStorage'}
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
          Để học viên và admin ở các máy tính khác nhau cùng thấy chung bài tập và bài nộp, Firebase cần được cấu hình trong biến môi trường của website (Vercel). Ô nhập bên dưới chỉ áp dụng cho trình duyệt hiện tại:
        </p>

        {configStatus && (
          <div style={{ padding: '10px 14px', background: isFirebaseConnected ? '#dcfce7' : '#fef3c7', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600 }}>
            {configStatus}
          </div>
        )}

        {isFirebaseConfiguredByEnv() ? (
          <p style={{ fontSize: '0.88rem', color: '#166534', fontWeight: 600 }}>
            ✅ Firebase đã được cấu hình sẵn cho toàn bộ website (qua biến môi trường). Mọi học viên và admin đều dùng chung dữ liệu.
          </p>
        ) : (
        <form onSubmit={handleSaveFirebase} className="admin-form-grid">
          <div className="form-group">
            <label>Firebase API Key *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Firebase Project ID *</label>
            <input
              type="text"
              className="admin-input"
              placeholder="my-workready-app"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Auth Domain (Tùy chọn)</label>
            <input
              type="text"
              className="admin-input"
              placeholder="my-workready-app.firebaseapp.com"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Storage Bucket (Tùy chọn)</label>
            <input
              type="text"
              className="admin-input"
              placeholder="my-workready-app.appspot.com"
              value={storageBucket}
              onChange={(e) => setStorageBucket(e.target.value)}
            />
          </div>

          <div className="form-actions full-width" style={{ gap: '10px' }}>
            {isFirebaseConnected && (
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDisconnect}>
                Ngắt Kết Nối
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm">
              Lưu Cấu Hình &amp; Kết Nối Firebase
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
