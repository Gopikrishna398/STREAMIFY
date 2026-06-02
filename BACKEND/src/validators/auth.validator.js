import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format").toLowerCase(),
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(80),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format").toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const onboardingSchema = z.object({
  body: z.object({
    bio: z.string().trim().min(1, "Bio is required").max(500),
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(80),
    learningLanguage: z.string().trim().min(1, "Learning language is required").max(40),
    location: z.string().trim().min(1, "Location is required").max(120),
    nativeLanguage: z.string().trim().min(1, "Native language is required").max(40),
  }),
});

export const profileUpdateSchema = z.object({
  body: z
    .object({
      bio: z.string().trim().max(500).optional(),
      fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(80).optional(),
      learningLanguage: z.string().trim().min(1).max(40).optional(),
      location: z.string().trim().max(120).optional(),
      nativeLanguage: z.string().trim().min(1).max(40).optional(),
      profilePic: z.string().startsWith("data:image/", "A valid image file is required").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one profile field is required",
    }),
});
