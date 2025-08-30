import admin from "firebase-admin";
import serviceAccount from "../key.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});

const db = admin.firestore();

const tasks = [
  {
    title: "🏰 Task 1 – Carolinum (Rectorate)",
    description: `The first task awaits you:\nEvery kingdom has its castle… Where does the university wear its crown?\n\nWhat is the name that you see on the building?\nUniversitas (CAROLINA)`,
    order: 1,
    active: true,
    validation: "text:contains:CAROLINA",
    points: 10,
  },
  {
    title: "🪪 Task 2 – CU Point (ISIC)",
    description: `Task 2: Adventurers need badges… Write down the number missing from the address which you will find near the door: Celetná (13)`,
    order: 2,
    active: true,
    validation: "text:equals:13",
    points: 10,
  },
  {
    title: "🍲 Task 3 – Canteen (Menza)",
    description: `Heroes can’t fight on empty stomachs!... Task: Take a team selfie in front of the building to continue!`,
    order: 3,
    active: true,
    validation: "photo",
    points: 10,
  },
  {
    title: "📜 Task 4 – Faculty advisors & deans",
    description: `Every journey has a wise guide… Dare to enter the place of deans and student advisors of your faculty! Make sure to take a picture of (scan a qr code?)`,
    order: 4,
    active: true,
    validation: "photo",
    points: 10,
  },
  {
    title: "📚 Task 5 – National Library",
    description: `Great job dear adventurers! Now your journey grows heavier—can you move onward to the great halls of the National Library? GPS`,
    order: 5,
    active: true,
    validation: "photo",
    points: 10,
  },
  {
    title: "🎭 Task 6 – Faculty of Arts",
    description: `Brains are nice, but so is imagination… Task Idea: Count the columns in front of the entrance/write down the name from the sign… Columns: 8. Sign: je tam doska…`,
    order: 6,
    active: true,
    validation: "text:equals:8",
    points: 10,
  },
  {
    title: "🔥 Task 7 – Jan Palach memorial",
    description: `Not all student stories are about exams… Can you write down the name of the student that the second memorial is dedicated to? Jan Zajíc`,
    order: 7,
    active: true,
    validation: "text:contains:ZAJIC",
    points: 10,
  },
  {
    title: "⚖️ Task 8 – Faculty of Law",
    description: `Fantastic! Here is the Faculty of Law… Task: write down the name engraved near the entrance / Take a photo……`,
    order: 8,
    active: true,
    validation: "photo",
    points: 10,
  },
  {
    title: "🌉 Task 9 – Charles Bridge",
    description: `Dear adventurer… Follow the Vltava river… Once you arrive, take a picture in front of the statue of King Charles.`,
    order: 9,
    active: true,
    validation: "photo",
    points: 10,
  },
  {
    title: "🏁 Final message",
    description: `Congratulations, heroes! You’ve pieced together the lost Student Survival Map…`,
    order: 10,
    active: true,
    validation: "",
    points: 0,
  },
];

async function main() {
  // Vymaž všetky existujúce tasky
  const snapshot = await db.collection("tasks").get();
  const batch = db.batch();
  snapshot.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  // Pridaj nové tasky
  for (const task of tasks) {
    await db.collection("tasks").add({
      ...task,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log("All tasks replaced!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
