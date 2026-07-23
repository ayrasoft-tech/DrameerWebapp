import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXT7qWdMs92WGqScUm8h4NhI-PIj2di1g",
  authDomain: "drameerfaizalsdentalcare-dee74.firebaseapp.com",
  projectId: "drameerfaizalsdentalcare-dee74",
  storageBucket: "drameerfaizalsdentalcare-dee74.firebasestorage.app",
  messagingSenderId: "647829510570",
  appId: "1:647829510570:web:cdb6b295396bf2b6b733d3",
  measurementId: "G-6GCRDSWM7Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// THIS IS THE CRITICAL LINE: Notice the 'export' keyword before 'const db'
export const db = getFirestore(app);