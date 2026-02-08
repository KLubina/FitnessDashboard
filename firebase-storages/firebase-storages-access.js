import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  nutritionConfig,
  weightConfig,
  dashboardConfig,
  stepPlannerConfig,
  nutritionPlannerConfig,
} from "./firebase-configs.js";

// Initialize Apps
const nutritionApp = initializeApp(nutritionConfig, "nutrition");
const weightApp = initializeApp(weightConfig, "weight");
const dashboardApp = initializeApp(dashboardConfig, "dashboard");
const stepPlannerApp = initializeApp(stepPlannerConfig, "stepPlanner");
const nutritionPlannerApp = initializeApp(
  nutritionPlannerConfig,
  "nutritionPlanner"
);

// Initialize Services
export const nutritionDb = getFirestore(nutritionApp);
export const weightDb = getFirestore(weightApp);
export const dashboardDb = getFirestore(dashboardApp);
export const stepPlannerDb = getFirestore(stepPlannerApp);
export const nutritionPlannerDb = getFirestore(nutritionPlannerApp);
export const auth = getAuth(dashboardApp);

// Export app instances
export {
  nutritionApp,
  weightApp,
  dashboardApp,
  stepPlannerApp,
  nutritionPlannerApp,
};

// Export Firebase modules for use in other files
export {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  orderBy,
  query,
  where,
  serverTimestamp,
  getDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
