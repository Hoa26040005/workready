import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

// Lấy cấu hình Firebase: ưu tiên file .env (dùng chung cho mọi người truy cập web),
// sau đó mới tới cấu hình admin nhập tay (chỉ lưu trên trình duyệt hiện tại).
export function getFirebaseConfig() {
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  const saved = localStorage.getItem('workready_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Invalid saved firebase config', e);
    }
  }

  return null;
}

// true nếu cấu hình Firebase được nhúng sẵn qua biến môi trường (Vercel / .env)
export function isFirebaseConfiguredByEnv() {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

export function saveFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem('workready_firebase_config');
    db = null;
    return;
  }
  localStorage.setItem('workready_firebase_config', JSON.stringify(config));
}

// Khởi tạo Firebase App & Firestore
let db = null;

export function initFirebase() {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    db = null;
    return null;
  }

  try {
    // Mỗi project dùng một app riêng theo tên, để khi admin đổi cấu hình
    // thì không bị dính lại app cũ đã khởi tạo trước đó.
    const appName = `workready-${config.projectId}`;
    const existing = getApps().find((a) => a.name === appName);
    const app = existing || initializeApp(config, appName);
    db = getFirestore(app);
    return db;
  } catch (error) {
    console.warn('Firebase initialization notice:', error.message);
    db = null;
    return null;
  }
}

function getDb() {
  return db || initFirebase();
}

// ==========================================
// FIRESTORE CRUD (dùng chung cho mọi collection)
// Document ID trên Firestore = String(item.id) để sửa / xóa đúng document.
// ==========================================

export async function upsertItem(collectionName, item) {
  const firestore = getDb();
  if (!firestore || item?.id === undefined || item?.id === null) return false;

  try {
    await setDoc(
      doc(firestore, collectionName, String(item.id)),
      { ...item, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error(`Error saving to Firebase "${collectionName}":`, error);
    return false;
  }
}

export async function upsertMany(collectionName, items) {
  if (!Array.isArray(items)) return;
  await Promise.all(items.map((item) => upsertItem(collectionName, item)));
}

export async function deleteItem(collectionName, id) {
  const firestore = getDb();
  if (!firestore || id === undefined || id === null) return false;

  try {
    await deleteDoc(doc(firestore, collectionName, String(id)));
    return true;
  } catch (error) {
    console.error(`Error deleting from Firebase "${collectionName}":`, error);
    return false;
  }
}

// Trả về mảng item, hoặc null nếu lỗi / chưa kết nối
export async function fetchCollection(collectionName, newestFirst = false) {
  const firestore = getDb();
  if (!firestore) return null;

  try {
    const snapshot = await getDocs(collection(firestore, collectionName));
    const list = [];
    snapshot.forEach((d) => {
      // eslint-disable-next-line no-unused-vars
      const { updatedAt, ...data } = d.data();
      list.push({ ...data, id: data.id ?? d.id });
    });
    // id được tạo bằng Date.now() nên sắp xếp theo id = theo thời gian tạo
    list.sort((a, b) => (newestFirst ? Number(b.id) - Number(a.id) : Number(a.id) - Number(b.id)));
    return list;
  } catch (error) {
    console.error(`Error fetching Firebase "${collectionName}":`, error);
    return null;
  }
}
