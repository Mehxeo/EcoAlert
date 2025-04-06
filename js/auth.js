// Import Firebase modules
import { auth } from '../firebase/firebaseconfig.js';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { saveUserData, getUserData } from './firestore.js';

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// Function to handle Google sign-in
async function signInWithGoogle() {
  try {
    console.log('Attempting Google sign-in...');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await saveUserData(user);
    console.log('Google sign-in successful:', user.displayName);
    
    // Update UI
    updateUIForSignedInUser(user);
    return user;
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    alert('Sign-in failed: ' + error.message);
  }
}

// Function to handle sign-out
async function signOutUser() {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    updateUIForSignedOutUser();
  } catch (error) {
    console.error('Error during sign-out:', error);
    alert('Sign-out failed: ' + error.message);
  }
}

// Function to update UI for signed-in user
function updateUIForSignedInUser(user) {
  const signInButton = document.getElementById('sign-in-button');
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  const userPhoto = document.getElementById('user-photo');
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  
  if (signInButton) signInButton.style.display = 'none';
  if (signOutButton) signOutButton.style.display = 'block';
  if (userInfo) userInfo.style.display = 'flex';
  
  if (userPhoto && user.photoURL) {
    userPhoto.src = user.photoURL;
    userPhoto.alt = user.displayName + "'s photo";
  }
  
  if (userName) userName.textContent = user.displayName;
  if (userEmail) userEmail.textContent = user.email;
  
  console.log('UI updated for signed-in user:', user.displayName);
}

// Function to update UI for signed-out user
function updateUIForSignedOutUser() {
  const signInButton = document.getElementById('sign-in-button');
  const signOutButton = document.getElementById('sign-out-button');
  const userInfo = document.getElementById('user-info');
  
  if (signInButton) signInButton.style.display = 'block';
  if (signOutButton) signOutButton.style.display = 'none';
  if (userInfo) userInfo.style.display = 'none';
  
  console.log('UI updated for signed-out user');
}

// Listen for authentication state changes
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('User is signed in:', user.displayName);
    const userData = await getUserData(user.uid);
    updateUIForSignedInUser(user);
  } else {
    console.log('User is signed out');
    updateUIForSignedOutUser();
  }
});

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Setting up authentication event listeners');
  
  // Add click event listener to sign-in button
  const signInButton = document.getElementById('sign-in-button');
  if (signInButton) {
    signInButton.addEventListener('click', signInWithGoogle);
  }
  
  // Add click event listener to sign-out button
  const signOutButton = document.getElementById('sign-out-button');
  if (signOutButton) {
    signOutButton.addEventListener('click', signOutUser);
  }
  
  // Check if user is already signed in
  if (auth.currentUser) {
    console.log('User already signed in:', auth.currentUser.displayName);
    updateUIForSignedInUser(auth.currentUser);
  }
}); 