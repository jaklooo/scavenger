#!/usr/bin/env tsx

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

// Sample tasks data
const sampleTasks = [
  {
    title: "Find the Hidden Logo",
    description: "Locate and photograph the FSV UK logo hidden somewhere in the building. The logo might be on a poster, sign, or digital display. Make sure the logo is clearly visible in your photo.",
    points: 10,
    order: 1,
    active: true,
  },
  {
    title: "Team Photo Challenge",
    description: "Take a creative team photo in front of the main entrance. All team members must be visible and everyone should be wearing something red to match our brand color!",
    points: 15,
    order: 2,
    active: true,
  },
  {
    title: "Scavenger Selfie",
    description: "Take a selfie with someone wearing FSV UK merchandise or holding an FSV UK item. Bonus points if they're not part of your team!",
    points: 20,
    order: 3,
    active: true,
  },
  {
    title: "Historical Hunt",
    description: "Find and photograph something that represents FSV UK's history or heritage. This could be an old photo, a plaque, historical document, or anything that shows our organization's past.",
    points: 25,
    order: 4,
    active: true,
  },
  {
    title: "Innovation Spotlight",
    description: "Record a 30-second video showcasing something innovative or modern within the FSV UK premises. Explain why you think it represents innovation in your video.",
    points: 30,
    order: 5,
    active: true,
  },
  {
    title: "Community Connection",
    description: "Take a photo or video that shows how FSV UK connects with the community. This could be community programs, partnerships, or outreach initiatives visible in the building.",
    points: 25,
    order: 6,
    active: true,
  },
  {
    title: "Future Vision",
    description: "Create a short video (max 1 minute) showing what you think represents the future of FSV UK. Use your creativity to capture your vision of where the organization is heading.",
    points: 35,
    order: 7,
    active: true,
  },
  {
    title: "Hidden Treasure",
    description: "Find the special QR code hidden somewhere in the building. Scan it and take a screenshot of the result. The QR code contains a special message for scavenger hunt participants!",
    points: 40,
    order: 8,
    active: true,
  },
];

async function seedTasks() {
  console.log("🌱 Starting to seed tasks...");

  try {
    for (const task of sampleTasks) {
      const docRef = await addDoc(collection(db, "tasks"), task);
      console.log(`✅ Created task: "${task.title}" with ID: ${docRef.id}`);
    }

    console.log(`🎉 Successfully seeded ${sampleTasks.length} tasks!`);
    console.log("\nTotal points available:", sampleTasks.reduce((sum, task) => sum + task.points, 0));
  } catch (error) {
    console.error("❌ Error seeding tasks:", error);
    process.exit(1);
  }
}

// Check if required environment variables are set
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error("\nPlease set these environment variables in your .env.local file");
  process.exit(1);
}

// Run the seed function
seedTasks()
  .then(() => {
    console.log("✨ Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
