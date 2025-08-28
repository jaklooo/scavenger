import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc,
  serverTimestamp,
  getDocs
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

async function createTestSubmissions() {
  try {
    console.log("🔐 Přihlašování admin účtu...");
    
    // Přihlášení ako admin
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      "admin@fsv-uk-scave.com", 
      "fsv12345"
    );
    
    console.log("✅ Admin přihlášen:", userCredential.user.email);
    
    // Získanie týmov a úloh
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    const tasksSnapshot = await getDocs(collection(db, "tasks"));
    
    console.log("📝 Vytváření test submissionov...");
    
    let submissionCount = 0;
    
    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;
      const teamData = teamDoc.data();
      
      console.log(`📸 Vytváření submissionov pre tým: ${teamData.name}`);
      
      // Vytvorenie 2-3 submissionov pre každý tým
      for (const taskDoc of tasksSnapshot.docs.slice(0, 2)) { // Prvé 2 úlohy
        const taskId = taskDoc.id;
        const taskData = taskDoc.data();
        
        const submissionData = {
          taskId: taskId,
          type: "image",
          storagePath: `submissions/${teamId}/test_image_${Date.now()}.jpg`,
          downloadURL: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
          caption: `${teamData.name} completion of ${taskData.title}`,
          approved: Math.random() > 0.3, // 70% schválených
          status: Math.random() > 0.3 ? "approved" : "pending",
          points: Math.random() > 0.3 ? (taskData.points || 10) : 0,
          createdAt: serverTimestamp(),
          submittedAt: serverTimestamp()
        };
        
        // Pridanie submission do subcollection týmu
        const submissionRef = await addDoc(
          collection(db, "teams", teamId, "submissions"), 
          submissionData
        );
        
        submissionCount++;
        console.log(`✅ Submission ${submissionCount} vytvorený: ${submissionRef.id}`);
      }
    }
    
    console.log(`\n🎉 Vytvorených ${submissionCount} test submissionov!`);
    console.log("🔑 Admin dashboard je teraz naplnený dátami:");
    console.log("   1. Idite na http://localhost:3000/admin");
    console.log("   2. Prihláste sa ako admin");
    console.log("   3. Uvidíte progress týmov a ich submissiony");
    console.log("   4. Môžete rozkliknúť týmy pre detail");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Chyba při vytváření test submissionov:", error);
    process.exit(1);
  }
}

createTestSubmissions();
