import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc,
  serverTimestamp 
} from "firebase/firestore";
import { config } from "dotenv";

// Load environment variables
config({ path: '.env.local' });

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestTask() {
  try {
    console.log("🔐 Přihlašování admin účtu...");
    
    // Přihlášení jako admin
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      "admin@fsv-uk-scave.com", 
      "fsv12345"
    );
    
    console.log("✅ Admin přihlášen:", userCredential.user.email);

    console.log("📝 Vytváření test tasku...");
    
    // Vytvoření test tasku
    const taskData = {
      title: "Vyfot se u budovy FSV UK",
      description: "Najděte hlavní vchod do budovy Fakulty sociálních věd UK a vyfotografujte se s celým týmem před ním. Budova se nachází na adrese Smetanovo nábřeží 6, Praha 1.",
      type: "photo",
      points: 10,
      order: 1,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      hints: [
        "Budova FSV UK se nachází na Smetanově nábřeží",
        "Hledejte moderní budovu s velkými skleněnými plochami",
        "Foto musí obsahovat všechny členy týmu"
      ],
      requirements: [
        "Všichni členové týmu musí být na fotce",
        "Musí být vidět název nebo logo FSV UK",
        "Foto musí být pořízeno před hlavním vchodem"
      ]
    };

    const docRef = await addDoc(collection(db, "tasks"), taskData);
    
    console.log("✅ Test task vytvořen s ID:", docRef.id);
    console.log("📋 Obsah tasku:", taskData);
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Chyba při vytváření test tasku:", error);
    
    if (error.code === 'auth/user-not-found') {
      console.log("⚠️ Admin účet neexistuje, možná potřebuje být vytvořen z aplikace");
    }
    
    process.exit(1);
  }
}

createTestTask();
