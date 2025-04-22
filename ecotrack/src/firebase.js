import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, getDocs } from "firebase/firestore";
import { getDatabase, ref, set, get, update, onValue, remove } from "firebase/database"; // Realtime Database imports

const firebaseConfig = {
  apiKey: "AIzaSyAafMRXyF5aQVXGA6vjk_arexvq1Mf2Xkw",
  authDomain: "ecotrack-web-panel.firebaseapp.com",
  databaseURL: "https://ecotrack-web-panel-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ecotrack-web-panel",
  storageBucket: "ecotrack-web-panel.appspot.com",
  messagingSenderId: "879072790810",
  appId: "1:879072790810:web:8a510c63c94958365904a3",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth();
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app); // Initialize Realtime Database

// Export Firestore utilities
export { collection, doc, getDoc, setDoc, updateDoc, getDocs };

// Export Realtime Database utilities
export { ref, set, get, update, onValue, remove };
export { app};
