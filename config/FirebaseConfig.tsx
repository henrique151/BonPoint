// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA37olSUh6YQcBk05v0oDof8B84reeUpYQ",
  authDomain: "bonpoint-b01e4.firebaseapp.com",
  projectId: "bonpoint-b01e4",
  storageBucket: "bonpoint-b01e4.appspot.com",
  messagingSenderId: "673160039167",
  appId: "1:673160039167:web:1ccd1aa0aa88f21e01daca",
  measurementId: "G-1FVN76GCVR"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

//const analytics = getAnalytics(app);