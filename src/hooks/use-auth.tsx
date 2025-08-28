"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserSchema } from "@/schemas";
import toast from "react-hot-toast";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, teamId?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userData?.role === "admin" || (userData?.email ? ADMIN_EMAILS.includes(userData.email) : false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const parsedData = UserSchema.parse({
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            });
            setUserData(parsedData);
          } else {
            // Create user document if it doesn't exist
            const isAdminEmail = ADMIN_EMAILS.includes(firebaseUser.email || "");
            const newUserData: User = {
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || "",
              role: isAdminEmail ? "admin" : "team",
              createdAt: new Date(),
            };

            await setDoc(doc(db, "users", firebaseUser.uid), {
              ...newUserData,
              createdAt: new Date(),
            });

            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user data");
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully signed in!");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, teamId?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(result.user, { displayName });

      // Create user document in Firestore  
      const isAdminEmail = ADMIN_EMAILS.includes(email);
      const newUserData: Partial<User> = {
        displayName,
        email,
        role: isAdminEmail ? "admin" : "team",
        createdAt: new Date(),
      };
      
      // Only add teamId if it's provided
      if (teamId) {
        newUserData.teamId = teamId;
      }

      await setDoc(doc(db, "users", result.user.uid), {
        ...newUserData,
        createdAt: new Date(),
      });

      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
      if (!userDoc.exists()) {
        const isAdminEmail = ADMIN_EMAILS.includes(result.user.email || "");
        const newUserData: User = {
          displayName: result.user.displayName || result.user.email?.split("@")[0] || "User",
          email: result.user.email || "",
          role: isAdminEmail ? "admin" : "team",
          createdAt: new Date(),
        };

        await setDoc(doc(db, "users", result.user.uid), {
          ...newUserData,
          createdAt: new Date(),
        });
      }

      toast.success("Successfully signed in with Google!");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("Successfully signed out!");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
