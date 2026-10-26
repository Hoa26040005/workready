import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initFirebase, 
  getFirebaseConfig, 
  saveFirebaseConfig,
  syncQuestionToFirebase, 
  fetchQuestionsFromFirebase,
  syncSubmissionToFirebase, 
  fetchSubmissionsFromFirebase, 
  updateSubmissionInFirebase 
} from '../services/firebase';

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

export function DataProvider({ children }) {
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('workready_questions');
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
  });

  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem('workready_videos');
    return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('workready_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem('workready_quizzes');
    return saved ? JSON.parse(saved) : DEFAULT_QUIZZES;
  });

  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('workready_submissions');
    return saved ? JSON.parse(saved) : DEFAULT_SUBMISSIONS;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Khởi tạo và kiểm tra kết nối Firebase khi khởi động
  useEffect(() => {
    const dbInstance = initFirebase();
    if (dbInstance) {
      setIsFirebaseConnected(true);
      // Đồng bộ bài nộp và câu hỏi từ Firebase nếu có
      fetchSubmissionsFromFirebase().then((cloudSubs) => {
        if (cloudSubs && cloudSubs.length > 0) {
          setSubmissions(cloudSubs);
        }
      });
      fetchQuestionsFromFirebase().then((cloudQuestions) => {
        if (cloudQuestions && cloudQuestions.length > 0) {
          setQuestions(cloudQuestions);
        }
      });
    }
  }, []);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('workready_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('workready_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('workready_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('workready_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('workready_submissions', JSON.stringify(submissions));
  }, [submissions]);

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

  // Questions Actions
  const addQuestion = async (newQ) => {
    const item = { ...newQ, id: Date.now() };
    setQuestions((prev) => [item, ...prev]);
    // Đồng bộ lên Firebase nếu kết nối
    if (isFirebaseConnected) {
      await syncQuestionToFirebase(item);
    }
  };

  const updateQuestion = (id, updated) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Videos Actions
  const addVideo = (newV) => {
    const item = { ...newV, id: Date.now() };
    setVideos((prev) => [...prev, item]);
  };

  const updateVideo = (id, updated) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const deleteVideo = (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  // Tasks Actions
  const addTask = (newT) => {
    const item = { ...newT, id: Date.now(), completed: false };
    setTasks((prev) => [...prev, item]);
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Quiz Actions
  const addQuiz = (newQz) => {
    const item = { ...newQz, id: Date.now() };
    setQuizzes((prev) => [...prev, item]);
  };

  const deleteQuiz = (id) => {
    setQuizzes((prev) => prev.filter((qz) => qz.id !== id));
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

    // Lưu bài tập lên Firebase
    if (isFirebaseConnected) {
      const cloudId = await syncSubmissionToFirebase(item);
      if (cloudId) {
        console.log('Submission synced to Firebase Firestore with ID:', cloudId);
      }
    }
  };

  const updateSubmissionFeedback = async (id, adminFeedback) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, adminFeedback, status: 'Reviewed' } : s))
    );

    if (isFirebaseConnected) {
      await updateSubmissionInFirebase(id, adminFeedback);
    }
  };

  const deleteSubmission = (id) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================
  // XUẤT DỮ LIỆU (EXPORT JSON) & NHẬP (IMPORT)
  // ==========================================
  const exportAllData = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      questions,
      videos,
      tasks,
      quizzes,
      submissions
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `workready-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importAllData = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.questions && Array.isArray(parsed.questions)) setQuestions(parsed.questions);
      if (parsed.videos && Array.isArray(parsed.videos)) setVideos(parsed.videos);
      if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.quizzes && Array.isArray(parsed.quizzes)) setQuizzes(parsed.quizzes);
      if (parsed.submissions && Array.isArray(parsed.submissions)) setSubmissions(parsed.submissions);
      return true;
    } catch (e) {
      console.error('Lỗi nhập dữ liệu JSON:', e);
      return false;
    }
  };

  // Reset to default mock data
  const resetAllData = () => {
    setQuestions(DEFAULT_QUESTIONS);
    setVideos(DEFAULT_VIDEOS);
    setTasks(DEFAULT_TASKS);
    setQuizzes(DEFAULT_QUIZZES);
    setSubmissions(DEFAULT_SUBMISSIONS);
    localStorage.removeItem('workready_questions');
    localStorage.removeItem('workready_videos');
    localStorage.removeItem('workready_tasks');
    localStorage.removeItem('workready_quizzes');
    localStorage.removeItem('workready_submissions');
  };

  return (
    <DataContext.Provider
      value={{
        questions,
        videos,
        tasks,
        quizzes,
        submissions,
        isAdminOpen,
        setIsAdminOpen,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        isFirebaseConnected,
        setIsFirebaseConnected,
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
