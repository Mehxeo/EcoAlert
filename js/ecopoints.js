import { auth } from './firestore.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

onAuthStateChanged(auth, user => {
    const signInLink = document.getElementById('sign-in');
    if (user) {
        signInLink.textContent = user.displayName || user.email;
    }
    else {
        signInLink.textContent = "Sign In";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('user')) {
        const userString = localStorage.getItem('user');
        const user = JSON.parse(userString);
        document.getElementById('sign-in').textContent = user.name;
    }
});