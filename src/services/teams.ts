import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Team, TeamSchema } from "@/schemas";

export async function createTeam(name: string): Promise<string> {
  try {
    const teamData = {
      name,
      createdAt: new Date(),
      memberCount: 1,
    };

    // Validate team data
    TeamSchema.parse(teamData);

    const docRef = await addDoc(collection(db, "teams"), {
      ...teamData,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating team:", error);
    throw new Error("Failed to create team");
  }
}

export async function getTeam(teamId: string): Promise<Team | null> {
  try {
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    
    if (!teamDoc.exists()) {
      return null;
    }

    const data = teamDoc.data();
    return TeamSchema.parse({
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    });
  } catch (error) {
    console.error("Error getting team:", error);
    throw new Error("Failed to get team");
  }
}

export async function getAllTeams(): Promise<Array<Team & { id: string }>> {
  try {
    const teamsQuery = query(
      collection(db, "teams"),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(teamsQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...TeamSchema.parse({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        }),
      };
    });
  } catch (error) {
    console.error("Error getting all teams:", error);
    throw new Error("Failed to get teams");
  }
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
  try {
    await updateDoc(doc(db, "teams", teamId), updates);
  } catch (error) {
    console.error("Error updating team:", error);
    throw new Error("Failed to update team");
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "teams", teamId));
  } catch (error) {
    console.error("Error deleting team:", error);
    throw new Error("Failed to delete team");
  }
}
