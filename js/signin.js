import { auth, db } from './firestore.js';
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const googleSignInBtn = document.querySelector('.google-signin');
    const provider = new GoogleAuthProvider();

    googleSignInBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Successfully signed in:", user.displayName);

            // Create/Update user document in Firestore
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Create new user document if it doesn't exist
                await setDoc(userRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    points: 0,
                    createdAt: new Date().toISOString(),
                    actions: []
                });
            }

            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                points: 0,
                createdAt: new Date().toISOString(),
                actions: []
            }));

            window.location.href = "ecopoints.html";
            console.log(localStorage.getItem('user'));
        } catch (error) {
            console.error("Error signing in:", error);
        }
    });
});