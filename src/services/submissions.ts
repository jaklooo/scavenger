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

export interface TeamProgress {
  teamId: string;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalPoints: number;
  lastActivity: any;
  submissions: Submission[];
  profilePhoto?: string;
  description?: string;
}

export async function createSubmission(
  teamId: string,
  taskId: string,
  file: File,
  caption?: string
): Promise<string> {
  try {
    const submissionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${submissionId}_${file.name}`;
    const storageRef = ref(storage, `submissions/${teamId}/${fileName}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Create submission document
    const submissionData = {
      taskId,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      storagePath: `submissions/${teamId}/${fileName}`,
      downloadURL,
      caption: caption || "",
      approved: false,
      createdAt: new Date(),
      status: "pending",
      submittedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(
      collection(db, "teams", teamId, "submissions"), 
      submissionData
    );
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating submission:", error);
    throw new Error("Failed to create submission");
  }
}

export async function getSubmissionsByTeam(teamId: string): Promise<Submission[]> {
  try {
    const submissionsRef = collection(db, "teams", teamId, "submissions");
    const q = query(submissionsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        taskId: data.taskId,
        type: data.type,
        storagePath: data.storagePath,
        downloadURL: data.downloadURL,
        caption: data.caption,
        approved: data.approved,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || "pending",
        submittedAt: data.submittedAt,
        points: data.points || 0
      };
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
}

export async function getSubmission(teamId: string, submissionId: string): Promise<Submission | null> {
  try {
    const docRef = doc(db, "teams", teamId, "submissions", submissionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        taskId: data.taskId,
        type: data.type,
        storagePath: data.storagePath,
        downloadURL: data.downloadURL,
        caption: data.caption,
        approved: data.approved,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || "pending",
        submittedAt: data.submittedAt,
        points: data.points || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching submission:", error);
    return null;
  }
}

export async function updateSubmission(teamId: string, submissionId: string, updates: Partial<Submission>): Promise<void> {
  try {
    await updateDoc(doc(db, "teams", teamId, "submissions", submissionId), updates);
  } catch (error) {
    console.error("Error updating submission:", error);
    throw new Error("Failed to update submission");
  }
}

export async function deleteSubmission(teamId: string, submissionId: string): Promise<void> {
  try {
    const submission = await getSubmission(teamId, submissionId);
    
    if (submission) {
      // Delete file from storage
      try {
        await deleteObject(ref(storage, submission.storagePath));
      } catch (storageError) {
        console.error("Error deleting file from storage:", storageError);
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, "teams", teamId, "submissions", submissionId));
    }
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw new Error("Failed to delete submission");
  }
}

// Admin funkcie pre dashboard
export async function getAllSubmissionsForAdmin(): Promise<any[]> {
  try {
    const teams = await getDocs(collection(db, "teams"));
    const allSubmissions: any[] = [];
    
    for (const teamDoc of teams.docs) {
      const teamData = teamDoc.data();
      const submissions = await getSubmissionsByTeam(teamDoc.id);
      
      submissions.forEach(submission => {
        allSubmissions.push({
          ...submission,
          teamId: teamDoc.id,
          teamName: teamData.name
        });
      });
    }
    
    return allSubmissions.sort((a, b) => 
      b.submittedAt?.seconds - a.submittedAt?.seconds
    );
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    return [];
  }
}

export async function getTeamsProgress(): Promise<TeamProgress[]> {
  try {
    // Získanie všetkých týmov
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    
    // Získanie všetkých úloh
    const tasksSnapshot = await getDocs(collection(db, "tasks"));
    const totalTasks = tasksSnapshot.size;
    
    // Vytvorenie progress reportu pre každý tým
    const teamsProgress: TeamProgress[] = [];
    
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data();
      const teamId = teamDoc.id;
      
      // Získanie submissionov pre tento tým
      const teamSubmissions = await getSubmissionsByTeam(teamId);
      
      // Počítanie štatistík
      const pendingSubmissions = teamSubmissions.filter(sub => sub.status === "pending").length;
      const approvedSubmissions = teamSubmissions.filter(sub => sub.status === "approved").length;
      const completedTasks = approvedSubmissions;
      const totalPoints = teamSubmissions
        .filter(sub => sub.status === "approved")
        .reduce((sum, sub) => sum + (sub.points || 0), 0);
      
      // Posledná aktivita
      const lastActivity = teamSubmissions.length > 0 
        ? teamSubmissions.sort((a, b) => b.submittedAt?.seconds - a.submittedAt?.seconds)[0].submittedAt
        : teamData.createdAt;
      
      teamsProgress.push({
        teamId,
        teamName: teamData.name,
        totalTasks,
        completedTasks,
        pendingSubmissions,
        approvedSubmissions,
        totalPoints,
        lastActivity,
        submissions: teamSubmissions,
        profilePhoto: teamData.profilePhoto,
        description: teamData.description
      });
    }
    
    return teamsProgress.sort((a, b) => b.totalPoints - a.totalPoints);
    
  } catch (error) {
    console.error("Error fetching teams progress:", error);
    return [];
  }
}

export async function approveSubmission(teamId: string, submissionId: string, points: number): Promise<void> {
  try {
    await updateSubmission(teamId, submissionId, {
      status: "approved",
      approved: true,
      points: points
    });
  } catch (error) {
    console.error("Error approving submission:", error);
    throw new Error("Failed to approve submission");
  }
}

export async function rejectSubmission(teamId: string, submissionId: string, reason?: string): Promise<void> {
  try {
    await updateSubmission(teamId, submissionId, {
      status: "rejected",
      approved: false,
      rejectionReason: reason
    });
  } catch (error) {
    console.error("Error rejecting submission:", error);
    throw new Error("Failed to reject submission");
  }
}
