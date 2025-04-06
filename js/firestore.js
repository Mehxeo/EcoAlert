import { db } from '../firebase/firebaseconfig.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Save user data to Firestore
export async function saveUserData(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            lastLogin: new Date().toISOString()
        }, { merge: true });
        console.log("User data saved successfully");
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

// Get user data from Firestore
export async function getUserData(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.log("No user data found");
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
} 