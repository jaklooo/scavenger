import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Progress, ProgressSchema } from "@/schemas";

export async function getTaskProgress(teamId: string, taskId: string): Promise<Progress | null> {
  try {
    const progressDoc = await getDoc(doc(db, "progress", teamId, "tasks", taskId));
    
    if (!progressDoc.exists()) {
      return null;
    }

    const data = progressDoc.data();
    return ProgressSchema.parse({
      ...data,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  } catch (error) {
    console.error("Error getting task progress:", error);
    throw new Error("Failed to get task progress");
  }
}

export async function getTeamProgress(teamId: string): Promise<Array<Progress & { taskId: string }>> {
  try {
    const progressQuery = query(
      collection(db, "progress", teamId, "tasks")
    );
    
    const snapshot = await getDocs(progressQuery);
    
    return snapshot.docs.map(doc => ({
      taskId: doc.id,
      ...ProgressSchema.parse({
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }),
    }));
  } catch (error) {
    console.error("Error getting team progress:", error);
    throw new Error("Failed to get team progress");
  }
}

export async function updateTaskProgress(
  teamId: string, 
  taskId: string, 
  status: Progress["status"],
  points?: number
): Promise<void> {
  try {
    const progressData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    
    // Add points if provided
    if (points !== undefined) {
      progressData.points = points;
    }
    
    await setDoc(doc(db, "progress", teamId, "tasks", taskId), progressData);
  } catch (error) {
    console.error("Error updating task progress:", error);
    throw new Error("Failed to update task progress");
  }
}

export async function getAllTeamsProgress(): Promise<Record<string, Array<Progress & { taskId: string }>>> {
  try {
    // This would need to be implemented with proper admin permissions
    // For now, we'll return empty object as teams are isolated
    return {};
  } catch (error) {
    console.error("Error getting all teams progress:", error);
    throw new Error("Failed to get all teams progress");
  }
}
