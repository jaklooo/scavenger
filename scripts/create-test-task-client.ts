#!/usr/bin/env tsx

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test task for admin testing
const testTask = {
  title: "Test úloha - Upload foto",
  description: "Nahrajte jednoduché foto z vášho telefónu. Môže to byť čokoľvek - selfie, výhľad z okna, alebo vaše obľúbené jedlo. Toto je testovacia úloha pre overenie funkčnosti aplikácie.",
  points: 5,
  type: "photo" as const,
  location: "Kdekoľvek",
  hint: "Použite fotoaparát vo vašom telefóne a nahrajte ľubovoľnú fotografiu. Stačí kliknúť na fotoaparát a vybrať fotografiu z galérie.",
  isActive: true,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function createTestTask() {
  try {
    console.log("🧪 Creating test task...");
    
    const taskRef = doc(db, "tasks", "test-task-1");
    await setDoc(taskRef, testTask);
    
    console.log(`✅ Created test task: ${testTask.title}`);
    console.log("🎉 Test task created successfully!");
    console.log("📱 Teams can now see this task and upload photos.");
    
  } catch (error) {
    console.error("❌ Error creating test task:", error);
    process.exit(1);
  }
}

// Run the function
createTestTask();
