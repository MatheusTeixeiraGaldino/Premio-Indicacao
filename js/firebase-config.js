// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7E3w1x9ezsU_59brfx75mJ6V2xwDpID4",
  authDomain: "gestao-premios-indicacao.firebaseapp.com",
  projectId: "gestao-premios-indicacao",
  storageBucket: "gestao-premios-indicacao.firebasestorage.app",
  messagingSenderId: "846675895191",
  appId: "1:846675895191:web:519c8776c3626949e6dad2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
