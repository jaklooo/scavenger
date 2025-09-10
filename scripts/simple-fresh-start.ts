#!/usr/bin/env tsx

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp 
} from "firebase/firestore";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Firebase configuration (using environment variables)
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

// Fresh start tasks matching our actual workflow systems exactly
const tasks = [
  {
    title: "📍 Task 1",
    description: "Start your adventure",
    order: 1,
    active: true,
    validation: "workflow:riddle_quiz",
    points: 25, // Max: riddle 5 pts + quiz 4x5 pts = 25 total (with deduction system)
  },
  {
    title: "🏛️ Task 2",
    description: "Continue",
    order: 2,
    active: true,
    validation: "workflow:riddle_deduction",
    points: 10, // Max 10 points, decreases with wrong attempts
  },
  {
    title: "🎨 Task 3",
    description: "Continue",
    order: 3,
    active: true,
    validation: "workflow:photo_upload",
    points: 5, // Fixed 5 points for photo submission
  },
  {
    title: "🌉 Task 4",
    description: "Continue",
    order: 4,
    active: true,
    validation: "workflow:photo_admin_review",
    points: 20, // Variable points awarded by admin (estimate)
  },
  {
    title: "🏰 Task 5",
    description: "Continue",
    order: 5,
    active: true,
    validation: "workflow:riddle_deduction",
    points: 10, // Max 10 points, decreases with wrong attempts (originally 10)
  },
  {
    title: "🎭 Task 6",
    description: "Continue",
    order: 6,
    active: true,
    validation: "workflow:quiz_two_questions",
    points: 10, // 2 questions × 5 pts each = 10 total
  },
  {
    title: "⚖️ Task 7",
    description: "Continue",
    order: 7,
    active: true,
    validation: "workflow:photo_upload",
    points: 5, // Fixed 5 points for photo submission
  },
  {
    title: "🔥 Task 8",
    description: "Continue",
    order: 8,
    active: true,
    validation: "workflow:quiz_seven_questions",
    points: 35, // 7 questions × 5 pts each = 35 total
  },
  {
    title: "🌉 Task 9",
    description: "Continue",
    order: 9,
    active: true,
    validation: "workflow:riddle_deduction",
    points: 10, // Max 10 points, min 1 point, decreases with wrong attempts
  },
];

async function simpleSeed() {
  try {
    console.log("🎯 Starting simple fresh start...");
    console.log("📝 Note: This will ADD new tasks with correct points (manual cleanup needed)");
    
    // Add fresh tasks with correct points
    console.log("➕ Adding fresh tasks...");
    const tasksCollectionRef = collection(db, "tasks");
    
    for (const task of tasks) {
      await addDoc(tasksCollectionRef, {
        ...task,
        createdAt: Timestamp.now(),
      });
      console.log(`  ✅ Added: ${task.title} (${task.points} pts)`);
    }
    
    // Calculate total possible points
    const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    console.log(`\n🎯 Total possible points: ${totalPoints}`);
    console.log(`📝 Note: Some tasks have deduction systems, so actual points may be lower`);
    
    console.log("\n📊 Points breakdown:");
    tasks.forEach(task => {
      console.log(`  ${task.title}: ${task.points} pts (max)`);
    });
    
    console.log("\n⚠️  IMPORTANT: You may need to manually delete old tasks from Firebase Console");
    console.log("✅ Simple fresh start completed!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Simple fresh start failed:", error);
    process.exit(1);
  }
}

simpleSeed();
