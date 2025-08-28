#!/usr/bin/env tsx

import { config } from "dotenv";
import admin from "firebase-admin";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

// Test task for admin testing
const testTask = {
  id: "test-task-1",
  title: "Test úloha - Upload foto",
  description: "Nahrajte jednoduché foto z vášho telefónu. Môže to byť čokoľvek - selfie, výhľad z okna, alebo vaše obľúbené jedlo. Toto je testovacia úloha.",
  points: 5,
  type: "photo" as const,
  location: "Kdekoľvek",
  hint: "Použite fotoaparát vo vašom telefóne a nahrajte ľubovoľnú fotografiu.",
  isActive: true,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function createTestTask() {
  try {
    console.log("🧪 Creating test task...");
    
    const tasksCollection = db.collection("tasks");
    
    await tasksCollection.doc(testTask.id).set(testTask);
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
