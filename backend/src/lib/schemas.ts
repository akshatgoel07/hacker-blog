import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters"),
  email: z.string().trim().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must be at most 128 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
export type SigninInput = z.infer<typeof signinSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required and cannot be empty")
    .max(30, "Name must be at most 30 characters"),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  id: z.string().min(1, "Post id is required"),
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
