import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAHZyFisu5EXlbaU_cri4IDuLkG9NqheHw",
    authDomain: "texttovisual-ai.firebaseapp.com",
    projectId: "texttovisual-ai",
    storageBucket: "texttovisual-ai.firebasestorage.app",
    messagingSenderId: "323591072732",
    appId: "1:323591072732:web:0e818e78b169a2b665bd19"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
