import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCgZEssQ-OQMjyYp3PV6pvKpx1NHZgMslA",
  authDomain: "groupe-bbl.firebaseapp.com",
  projectId: "groupe-bbl",
  storageBucket: "groupe-bbl.firebasestorage.app",
  messagingSenderId: "874485140986",
  appId: "1:874485140986:web:649396788b0b842c81a843"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
