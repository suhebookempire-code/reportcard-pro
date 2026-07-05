import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBYs94PC0D0a8ez5E1K-7_sh5naG1FIbk",
  authDomain: "suebem-3922f.firebaseapp.com",
  projectId: "suebem-3922f",
  storageBucket: "suebem-3922f.firebasestorage.app",
  messagingSenderId: "113302988264",
  appId: "1:113302988264:web:cd97a7fa1e18beafde705d",
  measurementId: "G-GFYNJYNYEP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { firebaseConfig };
