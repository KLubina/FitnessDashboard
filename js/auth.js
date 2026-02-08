import {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "../firebase-storages/firebase-storages-access.js";

function userIsLoggedIn(user) {
  return Boolean(user);
}

function toggleUiState(isLoggedIn) {
  const loginScreen = document.getElementById("loginScreen");
  const appContainer = document.getElementById("appContainer");
  if (loginScreen) loginScreen.style.display = isLoggedIn ? "none" : "flex";
  if (appContainer) appContainer.style.display = isLoggedIn ? "block" : "none";
}

function showLoginError(error) {
  alert("Login fehlgeschlagen: " + error.message);
}

function handleLoginError(error) {
  showLoginError(error);
}

export function handleAuthChanged(user) {
  const isLoggedIn = userIsLoggedIn(user);
  toggleUiState(isLoggedIn);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    handleLoginError(error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}

export function onAuthChanged(callback) {
  onAuthStateChanged(auth, callback);
}

export function waitForAuthState() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export default {
  handleAuthChanged,
  loginWithGoogle,
  logout,
  onAuthChanged,
  waitForAuthState
};