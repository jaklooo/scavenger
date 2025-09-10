import admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Initialize Firebase Admin
if (getApps().length === 0) {
  try {
    // Try to read service account key from key.json
    const serviceAccountPath = join(process.cwd(), 'key.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    initializeApp({
      credential: credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    console.log("✅ Firebase Admin initialized with service account");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin with service account:", error);
    throw error;
  }
}

const db = admin.firestore();

// Fresh start tasks matching our actual workflow systems exactly
const tasks = [
  {
    title: "📍 Task 1",
    description: "Start your adventure",
    order: 1,
    active: true,
    validation: "workflow:riddle_quiz", // Custom riddle + 4 quiz questions
    points: 25, // Max: riddle 5 pts + quiz 4x5 pts = 25 total (with deduction system)
  },
  {
    title: "🏛️ Task 2",
    description: "Continue",
    order: 2,
    active: true,
    validation: "workflow:riddle_deduction", // Riddle with deduction system
    points: 10, // Max 10 points, decreases with wrong attempts
  },
  {
    title: "🎨 Task 3",
    description: "Continue",
    order: 3,
    active: true,
    validation: "workflow:photo_upload", // Photo upload required
    points: 5, // Fixed 5 points for photo submission
  },
  {
    title: "🌉 Task 4",
    description: "Continue",
    order: 4,
    active: true,
    validation: "workflow:photo_admin_review", // Photo with admin review
    points: 20, // Variable points awarded by admin (estimate)
  },
  {
    title: "🏰 Task 5",
    description: "Continue",
    order: 5,
    active: true,
    validation: "workflow:riddle_deduction", // Riddle with deduction system
    points: 10, // Max 10 points, decreases with wrong attempts (originally 10)
  },
  {
    title: "🎭 Task 6",
    description: "Continue",
    order: 6,
    active: true,
    validation: "workflow:quiz_two_questions", // 2 questions: place + year
    points: 10, // 2 questions × 5 pts each = 10 total
  },
  {
    title: "⚖️ Task 7",
    description: "Continue",
    order: 7,
    active: true,
    validation: "workflow:photo_upload", // Photo upload required
    points: 5, // Fixed 5 points for photo submission
  },
  {
    title: "🔥 Task 8",
    description: "Continue",
    order: 8,
    active: true,
    validation: "workflow:quiz_seven_questions", // 7 questions total
    points: 35, // 7 questions × 5 pts each = 35 total
  },
  {
    title: "🌉 Task 9",
    description: "Continue",
    order: 9,
    active: true,
    validation: "workflow:riddle_deduction", // Final riddle with deduction
    points: 10, // Max 10 points, min 1 point, decreases with wrong attempts
  },
];

async function freshStartSeed() {
  try {
    console.log("🧹 Starting fresh start seed process...");
    
    // Step 1: Clear all existing tasks
    console.log("1️⃣ Clearing existing tasks...");
    const tasksSnapshot = await db.collection("tasks").get();
    const tasksBatch = db.batch();
    tasksSnapshot.forEach((doc) => tasksBatch.delete(doc.ref));
    await tasksBatch.commit();
    console.log(`✅ Deleted ${tasksSnapshot.size} old tasks`);
    
    // Step 2: Clear all team progress
    console.log("2️⃣ Clearing team progress...");
    const progressSnapshot = await db.collection("progress").get();
    const progressBatch = db.batch();
    progressSnapshot.forEach((doc) => progressBatch.delete(doc.ref));
    await progressBatch.commit();
    console.log(`✅ Deleted ${progressSnapshot.size} progress records`);
    
    // Step 3: Add fresh tasks with correct points
    console.log("3️⃣ Adding fresh tasks...");
    for (const task of tasks) {
      await db.collection("tasks").add({
        ...task,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    console.log(`✅ Added ${tasks.length} fresh tasks`);
    
    // Calculate total possible points
    const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    console.log(`🎯 Total possible points: ${totalPoints}`);
    console.log(`📝 Note: Some tasks have deduction systems, so actual points may be lower`);
    
    console.log("🎉 Fresh start completed successfully!");
    console.log("\n📊 Points breakdown:");
    tasks.forEach(task => {
      console.log(`  ${task.title}: ${task.points} pts (max)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Fresh start failed:", error);
    process.exit(1);
  }
}

freshStartSeed();
