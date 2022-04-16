import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDyepqx5Hh7VPEdIaAt9fKFRdTMpJD9KHU",
    authDomain: "whatsapp-clone-e71f4.firebaseapp.com",
    projectId: "whatsapp-clone-e71f4",
    storageBucket: "whatsapp-clone-e71f4.appspot.com",
    messagingSenderId: "88595495487",
    appId: "1:88595495487:web:be6a6407963cb59901d68a"
  };

const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const db = app.firestore();

const auth = app.auth();

const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };