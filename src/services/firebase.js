import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

// Lấy cấu hình Firebase từ localStorage hoặc .env
export function getFirebaseConfig() {
  const saved = localStorage.getItem('workready_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Invalid saved firebase config', e);
    }
  }

  // Cấu hình từ file .env nếu có
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
}

export function saveFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem('workready_firebase_config');
    return;
  }
  localStorage.setItem('workready_firebase_config', JSON.stringify(config));
}

// Khởi tạo Firebase App & Firestore
let db = null;

export function initFirebase() {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const apps = getApps();
    const app = apps.length === 0 ? initializeApp(config) : apps[0];
    db = getFirestore(app);
    return db;
  } catch (error) {
    console.warn('Firebase initialization notice:', error.message);
    return null;
  }
}

// ==========================================
// FIRESTORE CRUD OPERATIONS
// ==========================================

// 1. Lưu bài tập / câu hỏi phỏng vấn lên Firebase
export async function syncQuestionToFirebase(question) {
  const firestore = db || initFirebase();
  if (!firestore) return null;

  try {
    const docRef = await addDoc(collection(firestore, 'questions'), {
      ...question,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving question to Firebase:', error);
    return null;
  }
}

// 2. Lấy danh sách câu hỏi từ Firebase
export async function fetchQuestionsFromFirebase() {
  const firestore = db || initFirebase();
  if (!firestore) return null;

  try {
    const snapshot = await getDocs(collection(firestore, 'questions'));
    const list = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching questions from Firebase:', error);
    return null;
  }
}

// 3. Lưu bài nộp của học viên lên Firebase
export async function syncSubmissionToFirebase(submission) {
  const firestore = db || initFirebase();
  if (!firestore) return null;

  try {
    const docRef = await addDoc(collection(firestore, 'submissions'), {
      ...submission,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving submission to Firebase:', error);
    return null;
  }
}

// 4. Lấy danh sách bài nộp từ Firebase
export async function fetchSubmissionsFromFirebase() {
  const firestore = db || initFirebase();
  if (!firestore) return null;

  try {
    const snapshot = await getDocs(collection(firestore, 'submissions'));
    const list = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching submissions from Firebase:', error);
    return null;
  }
}

// 5. Cập nhật nhận xét của giảng viên trên Firebase
export async function updateSubmissionInFirebase(subId, adminFeedback) {
  const firestore = db || initFirebase();
  if (!firestore) return false;

  try {
    const subRef = doc(firestore, 'submissions', subId);
    await updateDoc(subRef, {
      adminFeedback,
      status: 'Reviewed',
      reviewedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating feedback in Firebase:', error);
    return false;
  }
}
