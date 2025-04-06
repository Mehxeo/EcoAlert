import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6mFJHSKZNHnXTt8GZhS2vmmUW7v-CBVo",
    authDomain: "ecoalert-3f52e.firebaseapp.com",
    projectId: "ecoalert-3f52e",
    storageBucket: "ecoalert-3f52e.appspot.com",
    messagingSenderId: "923290295650",
    appId: "1:923290295650:web:9cd979aaa6a03205cea03b",
    measurementId: "G-X61C6LH3K1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersRef = collection(db, 'users');
const actionsRef = collection(db, 'actions');

export { db, auth, usersRef as usersCollection, actionsRef as actionsCollection };
export default app;