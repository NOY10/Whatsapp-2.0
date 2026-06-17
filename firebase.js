import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB3A0WivtwGuJ5-bEtx6u5gOQC4aCSjffk',
  authDomain: 'whatsapp-clone-e71f4.firebaseapp.com',
  projectId: 'whatsapp-clone-e71f4',
  storageBucket: 'whatsapp-clone-e71f4.firebasestorage.app',
  messagingSenderId: '88595495487',
  appId: '1:88595495487:web:54c3aba7bb1ab4cd01d68a',
};

const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const db = app.firestore();

const auth = app.auth();

const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
