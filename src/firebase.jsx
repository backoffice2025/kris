// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAYC9Mxd5EBlzFOHekut4xcp-8ssPueBVk",
  authDomain: "kris2025.firebaseapp.com",
  projectId: "kris2025",
  storageBucket: "kris2025.firebasestorage.app",
  messagingSenderId: "400549513190",
  appId: "1:400549513190:web:13ce94c22558d6b7f4b827",
  measurementId: "G-EFMRYRXJ7Q"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // 👈 Add this
