// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-yZPFRez0SEp-eZIIMqbRUmKLPbiS5KY",
  authDomain: "uptown-4109b.firebaseapp.com",
  projectId: "uptown-4109b",
  storageBucket: "uptown-4109b.firebasestorage.app",
  messagingSenderId: "906841475136",
  appId: "1:906841475136:web:62bd9bfc41b8c472cc37a5",
  measurementId: "G-76XP718Y76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);