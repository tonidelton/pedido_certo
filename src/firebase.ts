import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuração do Firebase
// IMPORTANTE: Substitua pelas suas credenciais do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'SUA_API_KEY_AQUI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'SEU_PROJETO.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'SEU_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'SEU_PROJETO.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'SEU_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'SEU_APP_ID'
};

// Verifica se o Firebase está configurado
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== 'SUA_API_KEY_AQUI' && 
         firebaseConfig.projectId !== 'SEU_PROJECT_ID';
};

// Inicializa o Firebase apenas se configurado
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db };
