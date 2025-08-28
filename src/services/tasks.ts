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
import { Task, TaskSchema } from "@/schemas";

export async function createTask(taskData: Omit<Task, "active">): Promise<string> {
  try {
    const task = TaskSchema.parse({ ...taskData, active: true });

    const docRef = await addDoc(collection(db, "tasks"), task);
    return docRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

export async function getTask(taskId: string): Promise<Task | null> {
  try {
    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    
    if (!taskDoc.exists()) {
      return null;
    }

    const data = taskDoc.data();
    return TaskSchema.parse(data);
  } catch (error) {
    console.error("Error getting task:", error);
    throw new Error("Failed to get task");
  }
}

export async function getAllTasks(): Promise<Array<Task & { id: string }>> {
  try {
    const tasksQuery = query(
      collection(db, "tasks"),
      where("active", "==", true),
      orderBy("order", "asc")
    );
    
    const snapshot = await getDocs(tasksQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...TaskSchema.parse(doc.data()),
    }));
  } catch (error) {
    console.error("Error getting all tasks:", error);
    throw new Error("Failed to get tasks");
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  try {
    await updateDoc(doc(db, "tasks", taskId), updates);
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "tasks", taskId), { active: false });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}
