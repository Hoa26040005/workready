import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initFirebase,
  upsertItem,
  upsertMany,
  deleteItem,
  fetchCollection
} from '../services/firebase';

// Đọc localStorage an toàn: dữ liệu hỏng sẽ không làm sập cả trang
function loadLocal(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed ?? fallback;
  } catch (e) {
    console.warn(`Dữ liệu "${key}" trong localStorage bị lỗi, dùng dữ liệu mặc định.`, e);
    return fallback;
  }
}

const DEFAULT_QUESTIONS = [
  {
    id: 1,
    title: 'Tell me about yourself',
    body: 'Start with your current role or university studies, highlight 1-2 key achievements, mention core relevant skills, and tie it directly back to why you are excited about this position. Avoid reciting your entire resume chronologically.',
    category: 'General'
  },
  {
    id: 2,
    title: 'Why do you want to work at this company?',
    body: 'Demonstrate thorough company research. Mention specific initiatives, products, or core values that resonate with you, and explain clearly how your background equips you to contribute immediately to their mission.',
    category: 'Motivation'
  },
  {
    id: 3,
    title: 'What are your greatest strengths and weaknesses?',
    body: 'Align your strength directly with the job description backed by a tangible metric or project. For weaknesses, state a genuine growth area and showcase the concrete steps you are actively taking to overcome it.',
    category: 'Self-Awareness'
  },
  {
    id: 4,
    title: 'Can you tell me about a time you solved a difficult problem?',
    body: 'Leverage the STAR format (Situation, Task, Action, Result). Highlight your analytical thinking, individual action steps taken, and measurable impact on the outcome.',
    category: 'Behavioral'
  },
  {
    id: 5,
    title: 'Where do you see yourself in five years?',
    body: 'Show sustained commitment and realistic career progression. Discuss technical mastery, growing into cross-functional leadership, and delivering long-term value to the team.',
    category: 'Career Vision'
  }
];

const DEFAULT_VIDEOS = [
  {
    id: 1,
    title: 'The 60-Second Elevator Pitch Mastery',
    duration: '03:45',
    instructor: 'Sarah Jenkins (Ex-Google Recruiter)',
    videoUrl: 'https://www.youtube.com/watch?v=lykn5VghqH4',
    summary: 'Structure an unforgettable 1-minute intro that hooks interviewers.'
  },
  {
    id: 2,
    title: 'Structuring STAR Responses for Tech Roles',
    duration: '04:12',
    instructor: 'David Nguyen (Senior Engineering Lead)',
    videoUrl: 'https://www.youtube.com/watch?v=11XpW5o2h8Q',
    summary: 'Deliver crisp, metric-driven answers without rambling.'
  },
  {
    id: 3,
    title: 'Handling Salary Negotiation Questions Confidently',
    duration: '05:00',
    instructor: 'Emily Watson (Career Coach)',
    videoUrl: 'https://www.youtube.com/watch?v=0k5mU6E1JkM',
    summary: 'Benchmark your market value and handle early salary screeners.'
  },
  {
    id: 4,
    title: 'Asking Insightful Questions at the End of the Interview',
    duration: '03:30',
    instructor: 'Marcus Vance (VP of Talent)',
    videoUrl: 'https://www.youtube.com/watch?v=x-7iW4W8GvY',
    summary: 'Stand out by interviewing the interviewer with high-caliber questions.'
  }
];

const DEFAULT_TASKS = [
  {
    id: 1,
    title: 'Complete 1 STAR interview drill',
    category: 'Practice',
    points: 50,
    completed: true
  },
  {
    id: 2,
    title: 'Watch the Elevator Pitch instructional video',
    category: 'Video',
    points: 30,
    completed: true
  },
  {
    id: 3,
    title: 'Score 80%+ on Career Readiness Quiz',
    category: 'Assessment',
    points: 60,
    completed: false
  },
  {
    id: 4,
    title: 'Review 5 terminology flashcards with pronunciation',
    category: 'Vocabulary',
    points: 25,
    completed: false
  }
];

const DEFAULT_QUIZZES = [
  {
    id: 1,
    question: 'What does the letter "A" in the STAR interview framework stand for?',
    options: ['Approach', 'Action', 'Ambition', 'Analysis'],
    answerIndex: 1,
    explanation: '"Action" represents the specific steps and contributions you individually made to solve the challenge.'
  },
  {
    id: 2,
    question: 'When asked "What is your greatest weakness?", what is the most strategic approach?',
    options: [
      'Say you have no weaknesses because you are a perfectionist.',
      'State an authentic skill gap and explain concrete actions you are taking to improve it.',
      'List several critical technical failures in your previous jobs.',
      'Refuse to answer the question as it is a trick.'
    ],
    answerIndex: 1,
    explanation: 'Interviewers look for self-awareness, maturity, and a proactive continuous-learning mindset.'
  },
  {
    id: 3,
    question: 'When is the optimal time to send a post-interview thank you email?',
    options: [
      'Within 24 hours of completing the interview.',
      'At least two weeks later to not seem desperate.',
      'Immediately while walking out of the building.',
      'Only after you have received an offer.'
    ],
    answerIndex: 0,
    explanation: 'Sending a tailored thank-you note within 24 hours reinforces your enthusiasm and keeps you top-of-mind.'
  },
  {
    id: 4,
    question: 'In an elevator pitch, what should you avoid doing?',
    options: [
      'Highlighting your primary technical focus.',
      'Reciting your entire resume chronologically from school to present.',
      'Mentioning a quantifiable achievement.',
      'Explaining why you are interested in this specific role.'
    ],
    answerIndex: 1,
    explanation: 'An elevator pitch must be crisp (30-60s), forward-looking, and focused on value proposition, not your full CV.'
  }
];

const DEFAULT_SUBMISSIONS = [
  {
    id: 101,
    studentName: 'Học viên ẩn danh (Demo)',
    questionTitle: 'Tell me about yourself',
    answerText: 'I am a final-year software engineering student passionate about frontend web development. Recently, I built a high-performance e-commerce dashboard using React and Tailwind, improving loading speeds by 40%. I am excited about this role because your engineering team emphasizes scalable frontend architecture.',
    wordsCount: 46,
    aiFeedback: '✨ Strong response structure! You hit key highlights smoothly. To elevate it further, ensure you end with how your strengths solve this team’s specific priorities.',
    adminFeedback: 'Bài làm rất tốt, cấu trúc rõ ràng và có dẫn chứng số liệu 40% thuyết phục.',
    status: 'Reviewed',
    createdAt: 'Hôm nay, 10:30'
  }
];

const DataContext = createContext();

// Các collection nội dung do admin quản lý (dùng chung cho mọi học viên)
const CONTENT_COLLECTIONS = ['questions', 'videos', 'tasks', 'quizzes'];

export function DataProvider({ children }) {
  const [questions, setQuestions] = useState(() => loadLocal('workready_questions', DEFAULT_QUESTIONS));
  const [videos, setVideos] = useState(() => loadLocal('workready_videos', DEFAULT_VIDEOS));
  // Danh sách nhiệm vụ (định nghĩa do admin giao)
  const [taskDefs, setTaskDefs] = useState(() =>
    loadLocal('workready_tasks', DEFAULT_TASKS).map(({ completed, ...rest }) => rest) // eslint-disable-line no-unused-vars
  );
  // Tiến độ hoàn thành nhiệm vụ: riêng cho từng học viên (trình duyệt), KHÔNG đẩy lên cloud
  const [taskProgress, setTaskProgress] = useState(() => loadLocal('workready_task_progress', {}));
  const [quizzes, setQuizzes] = useState(() => loadLocal('workready_quizzes', DEFAULT_QUIZZES));
  const [submissions, setSubmissions] = useState(() => loadLocal('workready_submissions', DEFAULT_SUBMISSIONS));
  // ID các bài nộp do chính trình duyệt này gửi (để học viên xem lại nhận xét của giảng viên)
  const [mySubmissionIds, setMySubmissionIds] = useState(() => loadLocal('workready_my_submissions', []));

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  const tasks = taskDefs.map((t) => ({ ...t, completed: Boolean(taskProgress[t.id]) }));

  const setters = {
    questions: setQuestions,
    videos: setVideos,
    tasks: setTaskDefs,
    quizzes: setQuizzes
  };

  // Tải dữ liệu từ Firebase. Collection nào trên cloud còn trống thì giữ dữ liệu cục bộ.
  const loadFromCloud = useCallback(async () => {
    const results = await Promise.all([
      ...CONTENT_COLLECTIONS.map((name) => fetchCollection(name)),
      fetchCollection('submissions', true)
    ]);
    CONTENT_COLLECTIONS.forEach((name, i) => {
      const list = results[i];
      if (list && list.length > 0) setters[name](list);
    });
    const cloudSubs = results[CONTENT_COLLECTIONS.length];
    if (cloudSubs) setSubmissions(cloudSubs);
    return results.every((r) => r !== null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Khởi tạo và kiểm tra kết nối Firebase khi khởi động
  useEffect(() => {
    if (initFirebase()) {
      setIsFirebaseConnected(true);
      loadFromCloud();
    }
  }, [loadFromCloud]);

  // Sync with localStorage
  useEffect(() => { localStorage.setItem('workready_questions', JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem('workready_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('workready_tasks', JSON.stringify(taskDefs)); }, [taskDefs]);
  useEffect(() => { localStorage.setItem('workready_task_progress', JSON.stringify(taskProgress)); }, [taskProgress]);
  useEffect(() => { localStorage.setItem('workready_quizzes', JSON.stringify(quizzes)); }, [quizzes]);
  useEffect(() => { localStorage.setItem('workready_submissions', JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem('workready_my_submissions', JSON.stringify(mySubmissionIds)); }, [mySubmissionIds]);

  // Global Keyboard Shortcut: Ctrl + Shift + A (hoặc Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper: chỉ gọi cloud khi đã kết nối
  const cloud = (fn) => {
    if (isFirebaseConnected) return fn();
    return Promise.resolve(false);
  };

  // Questions Actions
  const addQuestion = (newQ) => {
    const item = { ...newQ, id: Date.now() };
    setQuestions((prev) => [...prev, item]);
    return cloud(() => upsertItem('questions', item));
  };

  const updateQuestion = (id, updated) => {
    const current = questions.find((q) => q.id === id);
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
    if (current) return cloud(() => upsertItem('questions', { ...current, ...updated }));
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    return cloud(() => deleteItem('questions', id));
  };

  // Videos Actions
  const addVideo = (newV) => {
    const item = { ...newV, id: Date.now() };
    setVideos((prev) => [...prev, item]);
    return cloud(() => upsertItem('videos', item));
  };

  const updateVideo = (id, updated) => {
    const current = videos.find((v) => v.id === id);
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
    if (current) return cloud(() => upsertItem('videos', { ...current, ...updated }));
  };

  const deleteVideo = (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    return cloud(() => deleteItem('videos', id));
  };

  // Tasks Actions
  const addTask = (newT) => {
    // eslint-disable-next-line no-unused-vars
    const { completed, ...rest } = newT;
    const item = { ...rest, id: Date.now() };
    setTaskDefs((prev) => [...prev, item]);
    return cloud(() => upsertItem('tasks', item));
  };

  const toggleTask = (id) => {
    setTaskProgress((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteTask = (id) => {
    setTaskDefs((prev) => prev.filter((t) => t.id !== id));
    setTaskProgress((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    return cloud(() => deleteItem('tasks', id));
  };

  // Quiz Actions
  const addQuiz = (newQz) => {
    const item = { ...newQz, id: Date.now() };
    setQuizzes((prev) => [...prev, item]);
    return cloud(() => upsertItem('quizzes', item));
  };

  const deleteQuiz = (id) => {
    setQuizzes((prev) => prev.filter((qz) => qz.id !== id));
    return cloud(() => deleteItem('quizzes', id));
  };

  // Submissions & Feedbacks Actions
  const addSubmission = async (sub) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.toLocaleDateString('vi-VN')}`;
    const item = {
      ...sub,
      id: Date.now(),
      createdAt: timeStr,
      status: 'Pending Review',
      adminFeedback: ''
    };
    setSubmissions((prev) => [item, ...prev]);
    setMySubmissionIds((prev) => [item.id, ...prev]);

    // Lưu bài nộp lên Firebase để admin ở máy khác cũng thấy
    return cloud(() => upsertItem('submissions', item));
  };

  const updateSubmissionFeedback = (id, adminFeedback) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, adminFeedback, status: 'Reviewed' } : s))
    );
    return cloud(() => upsertItem('submissions', { id, adminFeedback, status: 'Reviewed' }));
  };

  const deleteSubmission = (id) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    return cloud(() => deleteItem('submissions', id));
  };

  // Tải lại bài nộp mới nhất từ cloud (admin xem bài mới / học viên xem nhận xét mới)
  const refreshSubmissions = async () => {
    if (!isFirebaseConnected) return false;
    const cloudSubs = await fetchCollection('submissions', true);
    if (cloudSubs) setSubmissions(cloudSubs);
    return Boolean(cloudSubs);
  };

  // Đẩy toàn bộ dữ liệu cục bộ của admin lên cloud (dùng khi vừa kết nối Firebase)
  const pushAllToCloud = async () => {
    if (!initFirebase()) return false;
    await Promise.all([
      upsertMany('questions', questions),
      upsertMany('videos', videos),
      upsertMany('tasks', taskDefs),
      upsertMany('quizzes', quizzes),
      upsertMany('submissions', submissions)
    ]);
    return true;
  };

  // ==========================================
  // XUẤT DỮ LIỆU (EXPORT JSON) & NHẬP (IMPORT)
  // ==========================================
  const exportAllData = () => {
    const backupData = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      questions,
      videos,
      tasks: taskDefs,
      quizzes,
      submissions
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `workready-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const importAllData = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!parsed || typeof parsed !== 'object') return false;

      const keys = ['questions', 'videos', 'tasks', 'quizzes', 'submissions'];
      const valid = keys.filter((k) => Array.isArray(parsed[k]));
      if (valid.length === 0) return false;

      if (Array.isArray(parsed.questions)) setQuestions(parsed.questions);
      if (Array.isArray(parsed.videos)) setVideos(parsed.videos);
      if (Array.isArray(parsed.tasks)) {
        setTaskDefs(parsed.tasks.map(({ completed, ...rest }) => rest)); // eslint-disable-line no-unused-vars
      }
      if (Array.isArray(parsed.quizzes)) setQuizzes(parsed.quizzes);
      if (Array.isArray(parsed.submissions)) setSubmissions(parsed.submissions);

      // Đồng bộ dữ liệu vừa nhập lên cloud
      cloud(() =>
        Promise.all(valid.map((k) => upsertMany(k, k === 'tasks'
          ? parsed.tasks.map(({ completed, ...rest }) => rest) // eslint-disable-line no-unused-vars
          : parsed[k])))
      );
      return true;
    } catch (e) {
      console.error('Lỗi nhập dữ liệu JSON:', e);
      return false;
    }
  };

  // Reset to default mock data (chỉ trên trình duyệt này)
  const resetAllData = () => {
    setQuestions(DEFAULT_QUESTIONS);
    setVideos(DEFAULT_VIDEOS);
    setTaskDefs(DEFAULT_TASKS);
    setTaskProgress({});
    setQuizzes(DEFAULT_QUIZZES);
    setSubmissions(DEFAULT_SUBMISSIONS);
  };

  return (
    <DataContext.Provider
      value={{
        questions,
        videos,
        tasks,
        quizzes,
        submissions,
        mySubmissionIds,
        isAdminOpen,
        setIsAdminOpen,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        isFirebaseConnected,
        setIsFirebaseConnected,
        loadFromCloud,
        pushAllToCloud,
        refreshSubmissions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addVideo,
        updateVideo,
        deleteVideo,
        addTask,
        toggleTask,
        deleteTask,
        addQuiz,
        deleteQuiz,
        addSubmission,
        updateSubmissionFeedback,
        deleteSubmission,
        exportAllData,
        importAllData,
        resetAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
