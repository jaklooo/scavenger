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

async function createTestTeams() {
  try {
    console.log("🔐 Přihlašování admin účtu...");
    
    // Přihlášení jako admin
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      "admin@fsv-uk-scave.com", 
      "fsv12345"
    );
    
    console.log("✅ Admin přihlášen:", userCredential.user.email);
    
    console.log("📝 Vytváření testovacích týmů...");
    
    // Test tým 1
    const team1Data = {
      name: "FSV Hunters",
      memberCount: 3,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    const team1Ref = await addDoc(collection(db, "teams"), team1Data);
    console.log("✅ Tým 'FSV Hunters' vytvořen s ID:", team1Ref.id);

    // Test tým 2
    const team2Data = {
      name: "Prague Explorers",
      memberCount: 4,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    const team2Ref = await addDoc(collection(db, "teams"), team2Data);
    console.log("✅ Tým 'Prague Explorers' vytvořen s ID:", team2Ref.id);

    // Test tým 3
    const team3Data = {
      name: "Quest Masters",
      memberCount: 2,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    const team3Ref = await addDoc(collection(db, "teams"), team3Data);
    console.log("✅ Tým 'Quest Masters' vytvořen s ID:", team3Ref.id);

    console.log("\n🎉 Testovací týmy vytvořeny!");
    console.log("🔑 Pro otestování admin dashboardu:");
    console.log("   1. Jděte na http://localhost:3000");
    console.log("   2. Klikněte na 'Admin Login'");
    console.log("   3. Přihlašte se: admin@fsv-uk-scave.com / fsv12345");
    console.log("   4. Uvidíte 3 testovací týmy v admin dashboardu");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Chyba při vytváření testovacích týmů:", error);
    process.exit(1);
  }
}

createTestTeams();
