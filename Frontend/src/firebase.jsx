// import { initializeApp } from "firebase/app";
// import { 
//   getAuth, 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   signInWithPopup, 
//   signInWithRedirect,
//   getRedirectResult,
//   GoogleAuthProvider,
//   setPersistence,
//   browserLocalPersistence 
// } from "firebase/auth";
// import { getStorage } from "firebase/storage";

// Your Firebase configuration
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// // Set persistence to LOCAL (this ensures the user stays logged in even after browser restart)
// setPersistence(auth, browserLocalPersistence)
//   .catch((error) => {
//     console.error("Error setting persistence:", error);
//   });

// const googleProvider = new GoogleAuthProvider();
// export const storage = getStorage(app);
// // Export everything needed for authentication
// export {
//   auth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   signInWithRedirect,
//   getRedirectResult,
//   googleProvider
// };

// export default app;