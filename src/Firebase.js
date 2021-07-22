import Firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtK1U2tW_ZFON-BchPMj_58df9UlB8qk0",
  authDomain: "dans-todo-list.firebaseapp.com",
  projectId: "dans-todo-list",
  storageBucket: "dans-todo-list.appspot.com",
  messagingSenderId: "310282124542",
  appId: "1:310282124542:web:3edadf01698aa2fe5d39af",
  measurementId: "G-KJWQQ5C9S5",
};

Firebase.initializeApp(firebaseConfig);

export default Firebase;
