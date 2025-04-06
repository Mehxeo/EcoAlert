// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6mFJHSKZNHnXTt8GZhS2vmmUW7v-CBVo",
  authDomain: "ecoalert-3f52e.firebaseapp.com",
  projectId: "ecoalert-3f52e",
  storageBucket: "ecoalert-3f52e.firebasestorage.app",
  messagingSenderId: "923290295650",
  appId: "1:923290295650:web:9cd979aaa6a03205cea03b",
  measurementId: "G-X61C6LH3K1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export default app;
