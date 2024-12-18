import z from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const otpSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});
