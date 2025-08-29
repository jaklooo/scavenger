import { z } from "zod";

// User schemas
export const UserSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email address"),
  teamId: z.string().optional(),
  role: z.enum(["team", "admin"]).default("team"),
  createdAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Team schemas

export const TeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50, "Team name must be less than 50 characters"),
  createdAt: z.date(),
  memberCount: z.number().min(1).optional(),
  introductionSeen: z.boolean().optional(),
});

export type Team = z.infer<typeof TeamSchema>;

// Task schemas
export const TaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Task description is required"),
  points: z.number().min(1, "Points must be at least 1"),
  order: z.number().min(0, "Order must be non-negative"),
  active: z.boolean().default(true),
});

export type Task = z.infer<typeof TaskSchema>;

// Progress schemas
export const ProgressSchema = z.object({
  status: z.enum(["todo", "in_review", "done"]).default("todo"),
  updatedAt: z.date(),
});

export type Progress = z.infer<typeof ProgressSchema>;

// Submission schemas
export const SubmissionSchema = z.object({
  id: z.string().optional(),
  taskId: z.string(),
  type: z.enum(["image", "video"]),
  storagePath: z.string(),
  downloadURL: z.string().optional(),
  caption: z.string().optional(),
  createdAt: z.date(),
  approved: z.boolean().optional(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  submittedAt: z.any().optional(), // Timestamp from Firebase
  points: z.number().optional(),
  rejectionReason: z.string().optional(),
});

export type Submission = z.infer<typeof SubmissionSchema>;

// Registration schemas
export const TeamRegistrationSchema = z.object({
  teamName: z.string().min(1, "Team name is required").max(50, "Team name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TeamRegistration = z.infer<typeof TeamRegistrationSchema>;

// Login schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type Login = z.infer<typeof LoginSchema>;
