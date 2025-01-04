import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAafMRXyF5aQVXGA6vjk_arexvq1Mf2Xkw",
  authDomain: "ecotrack-web-panel.firebaseapp.com",
  projectId: "ecotrack-web-panel",
  storageBucket: "ecotrack-web-panel.appspot.com",
  messagingSenderId: "879072790810",
  appId: "1:879072790810:web:8a510c63c94958365904a3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
export const auth = getAuth();
export const db = getFirestore(app);

// Export Firestore utilities
export { collection, getDocs };
