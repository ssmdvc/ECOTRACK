// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAafMRXyF5aQVXGA6vjk_arexvq1Mf2Xkw",
  authDomain: "ecotrack-web-panel.firebaseapp.com",
  projectId: "ecotrack-web-panel",
  storageBucket: "ecotrack-web-panel.appspot.com",
  messagingSenderId: "879072790810",
  appId: "1:879072790810:web:8a510c63c94958365904a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export {auth}
export const db= getFirestore(app);
export default app;