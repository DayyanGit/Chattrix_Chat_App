import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-91419.firebaseapp.com",
  projectId: "reactchat-91419",
  storageBucket: "reactchat-91419.firebasestorage.app",
  messagingSenderId: "1007285165769",
  appId: "1:1007285165769:web:12daa317a0860dad50f718"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
