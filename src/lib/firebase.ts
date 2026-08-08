import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBTNHn8TnnZbg1xvLIY8w-lVn8kXljIlZc",
  authDomain: "overtime-calculation-bd.firebaseapp.com",
  projectId: "overtime-calculation-bd",
  storageBucket: "overtime-calculation-bd.firebasestorage.app",
  messagingSenderId: "272557996084",
  appId: "1:272557996084:web:8db043aef7c1b1f23f7261",
  databaseURL: "https://overtime-calculation-bd-default-rtdb.firebaseio.com/"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
