// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3k1DU8qiembsOXzJw_JcBK25THOgvgKc",
  authDomain: "chat-app-5961b.firebaseapp.com",
  projectId: "chat-app-5961b",
  storageBucket: "chat-app-5961b.firebasestorage.app",
  messagingSenderId: "152029189388",
  appId: "1:152029189388:web:4f159e9f9ff426b75e2529",
  measurementId: "G-2CE7LJ5SWQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC3k1DU8qiembsOXzJw_JcBK25THOgvgKc",
//   authDomain: "chat-app-5961b.firebaseapp.com",
//   projectId: "chat-app-5961b",
//   storageBucket: "chat-app-5961b.firebasestorage.app",
//   messagingSenderId: "152029189388",
//   appId: "1:152029189388:web:de3400123ec270985e2529",
//   measurementId: "G-7SNKWRDW9S"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// export {
//   auth,
//   db,
//   provider,
//   signInWithPopup,
//   signOut,
// };