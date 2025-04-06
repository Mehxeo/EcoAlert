import { auth, db } from './firestore.js';
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    // check if user exists
    if (localStorage.getItem('user')) {
        const userString = localStorage.getItem('user');
        const user = JSON.parse(userString);
        const signIn = document.getElementById('sign-in');
        const avatar = document.getElementById('user-avatar');
        
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
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                points: 0,
                createdAt: new Date().toISOString(),
                actions: []
            }));
        }
        if (signIn && user.name) {
            signIn.textContent = user.name;
        }
        
        if (avatar && user.photoURL) {
            avatar.src = user.photoURL;
            avatar.classList.remove('hidden');
        }
    }

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
                
                localStorage.setItem('user', JSON.stringify({
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    points: 0,
                    createdAt: new Date().toISOString(),
                    actions: []
                }));
            }
            else {
                const userData = userDoc.data();
                // Update localStorage with latest Firestore data
                localStorage.setItem('user', JSON.stringify({
                    uid: userData.uid,
                    name: userData.name,
                    email: userData.email,
                    photoURL: userData.photoURL,
                    points: userData.points,
                    createdAt: userData.createdAt,
                    actions: userData.actions
                })); 
            }


            window.location.href = "ecopoints.html";
            console.log(localStorage.getItem('user'));
        } catch (error) {
            console.error("Error signing in:", error);
        }
    });
});