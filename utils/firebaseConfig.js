// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaCkpjDXhr2zLUZPY8erP_ayR9G3lNbOM",
  authDomain: "instagram-9a93e.firebaseapp.com",
  projectId: "instagram-9a93e",
  storageBucket: "instagram-9a93e.appspot.com",
  messagingSenderId: "1093979132157",
  appId: "1:1093979132157:web:632cc4a568159ba44e6e94",
  measurementId: "G-K446TF1KQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Initialize Storage
