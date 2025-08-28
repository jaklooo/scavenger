import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
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

async function createAdminAndTestTask() {
  try {
    console.log("🔐 Vytváření nebo přihlašování admin účtu...");
    
    let userCredential;
    const adminEmail = "admin@fsv-uk-scave.com";
    const adminPassword = "fsv12345";
    
    try {
      // Zkus se přihlásit
      userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("✅ Admin účet existuje, přihlášen:", userCredential.user.email);
    } catch (loginError) {
      if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
        console.log("📝 Admin účet neexistuje, vytváření...");
        // Vytvoř admin účet
        userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("✅ Admin účet vytvořen:", userCredential.user.email);
      } else {
        throw loginError;
      }
    }

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
    console.log("📋 Obsah tasku:", {
      title: taskData.title,
      type: taskData.type,
      points: taskData.points,
      order: taskData.order
    });
    
    // Vytvoř druhý task
    console.log("📝 Vytváření druhého test tasku...");
    
    const taskData2 = {
      title: "Najdi sochu Jana Husa",
      description: "Vydejte se na Staroměstské náměstí a najděte sochu Jana Husa. Vyfotografujte se s celým týmem před touto historickou sochou.",
      type: "photo",
      points: 15,
      order: 2,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      hints: [
        "Socha se nachází na Staroměstském náměstí",
        "Jan Hus byl český kazatel a reformátor",
        "Socha je vysoká a výrazná dominanta náměstí"
      ],
      requirements: [
        "Celý tým musí být na fotografii",
        "Musí být vidět celá socha Jana Husa",
        "Foto musí být pořízeno ze vzdálenosti max. 10 metrů"
      ]
    };

    const docRef2 = await addDoc(collection(db, "tasks"), taskData2);
    
    console.log("✅ Druhý test task vytvořen s ID:", docRef2.id);
    console.log("📋 Obsah druhého tasku:", {
      title: taskData2.title,
      type: taskData2.type,
      points: taskData2.points,
      order: taskData2.order
    });
    
    console.log("\n🎉 Vše hotovo! Admin dashboard je připraven k testování.");
    console.log("🔑 Admin přihlášení: admin@fsv-uk-scave.com / fsv12345");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Chyba:", error);
    process.exit(1);
  }
}

createAdminAndTestTask();
