import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyClAbolSxbbli41f7Kw4imt3mPibkQ66MQ",
  authDomain: "eventorganizerapp-4be94.firebaseapp.com",
  projectId: "eventorganizerapp-4be94",
  storageBucket: "eventorganizerapp-4be94.firebasestorage.app",
  messagingSenderId: "42144132886",
  appId: "1:42144132886:web:735a31664a91c8b5226a37"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const firestore = getFirestore(app);

export { auth, firestore };
