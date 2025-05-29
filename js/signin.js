import { auth, db } from './firestore.js';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

onAuthStateChanged(auth, user => {
    const signinContainer = document.querySelector('.signin-container');
    const signInLink = document.getElementById('sign-in');
    if (user) {
        signInLink.textContent = user.displayName || user.email;
        signinContainer.innerHTML = `
            <h2 style="margin-bottom: 0.5em;">Welcome, <span class="Eco-Points">${user.displayName || user.email}</span>!</h2>
            <p style="margin-bottom: 1em;">You are already signed in.</p>
            <a href="ecopoints.html" class="cta-button" style="margin-bottom: 1em;">Go to EcoPoints</a>
            <a id="signout-btn" >Sign Out</button>
        `;
        signinContainer.classList.add('fade-in', 'delay-1');
        document.getElementById('signout-btn').onclick = async () => {
            await signOut(auth);
            window.location.reload();
        };
    }
    else {
        signInLink.textContent = "Sign In";
        signinContainer.innerHTML = `
            <h2 class="fade-in delay-1">Earn <span class="Eco-Points">EcoPoints</span> and Get <span class="Eco-Alert">EcoAlerts</span></h2>
            <p class="fade-in delay-2" style="opacity: 0;">Start earning EcoPoints and get personalized environmental alerts</p>    
            <button class="google-signin fade-in delay-3">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
            </button>
        `;
        console.log(user.displayName);
        signinContainer.classList.add('fade-in', 'delay-1');
    }
});

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
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
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

