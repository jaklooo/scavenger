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
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Submission, SubmissionSchema } from "@/schemas";

export async function createSubmission(
  teamId: string,
  taskId: string,
  file: File,
  caption?: string
): Promise<string> {
  try {
    const submissionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileExtension = file.name.split('.').pop();
    const storagePath = `teams/${teamId}/submissions/${submissionId}.${fileExtension}`;
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    
    // Create submission document
    const submissionData = {
      taskId,
      type: file.type.startsWith('video/') ? 'video' : 'image' as 'image' | 'video',
      storagePath,
      caption,
      createdAt: new Date(),
      approved: undefined, // Will be set by admin
    };

    const docRef = await addDoc(collection(db, "submissions", teamId), {
      ...submissionData,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating submission:", error);
    throw new Error("Failed to create submission");
  }
}

export async function getSubmission(teamId: string, submissionId: string): Promise<Submission | null> {
  try {
    const submissionDoc = await getDoc(doc(db, "submissions", teamId, submissionId));
    
    if (!submissionDoc.exists()) {
      return null;
    }

    const data = submissionDoc.data();
    return SubmissionSchema.parse({
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    });
  } catch (error) {
    console.error("Error getting submission:", error);
    throw new Error("Failed to get submission");
  }
}

export async function getTeamSubmissions(teamId: string): Promise<Array<Submission & { id: string; downloadUrl?: string }>> {
  try {
    const submissionsQuery = query(
      collection(db, "submissions", teamId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(submissionsQuery);
    
    const submissions = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const submission = SubmissionSchema.parse({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
        
        try {
          const downloadUrl = await getDownloadURL(ref(storage, submission.storagePath));
          return {
            id: doc.id,
            ...submission,
            downloadUrl,
          };
        } catch (error) {
          console.error("Error getting download URL:", error);
          return {
            id: doc.id,
            ...submission,
          };
        }
      })
    );

    return submissions;
  } catch (error) {
    console.error("Error getting team submissions:", error);
    throw new Error("Failed to get team submissions");
  }
}

export async function getTaskSubmissions(teamId: string, taskId: string): Promise<Array<Submission & { id: string; downloadUrl?: string }>> {
  try {
    const submissionsQuery = query(
      collection(db, "submissions", teamId),
      where("taskId", "==", taskId),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(submissionsQuery);
    
    const submissions = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const submission = SubmissionSchema.parse({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
        
        try {
          const downloadUrl = await getDownloadURL(ref(storage, submission.storagePath));
          return {
            id: doc.id,
            ...submission,
            downloadUrl,
          };
        } catch (error) {
          console.error("Error getting download URL:", error);
          return {
            id: doc.id,
            ...submission,
          };
        }
      })
    );

    return submissions;
  } catch (error) {
    console.error("Error getting task submissions:", error);
    throw new Error("Failed to get task submissions");
  }
}

export async function updateSubmission(
  teamId: string, 
  submissionId: string, 
  updates: Partial<Submission>
): Promise<void> {
  try {
    await updateDoc(doc(db, "submissions", teamId, submissionId), updates);
  } catch (error) {
    console.error("Error updating submission:", error);
    throw new Error("Failed to update submission");
  }
}

export async function deleteSubmission(teamId: string, submissionId: string): Promise<void> {
  try {
    // Get submission to get storage path
    const submission = await getSubmission(teamId, submissionId);
    
    if (submission) {
      // Delete file from storage
      try {
        await deleteObject(ref(storage, submission.storagePath));
      } catch (error) {
        console.error("Error deleting file from storage:", error);
      }
    }
    
    // Delete document
    await deleteDoc(doc(db, "submissions", teamId, submissionId));
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw new Error("Failed to delete submission");
  }
}
