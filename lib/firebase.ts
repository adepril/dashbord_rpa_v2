import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_Firebase_Api_Key ,
  authDomain: process.env.NEXT_PUBLIC_Firebase_Auth_Domain,
  projectId: process.env.NEXT_PUBLIC_Firebase_Project_Id,
  storageBucket: process.env.NEXT_PUBLIC_Firebase_Storage_Bucket,
  messagingSenderId: process.env.NEXT_PUBLIC_Firebase_Messaging_Sender_Id,
  appId: process.env.NEXT_PUBLIC_Firebase_App_Id
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
