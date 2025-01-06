import z from "zod";

export const displayNameSchema = z.object({
  displayName: z.string().min(3),
});

export const aboutSchema = z.object({
  about: z.string(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8, "Password should be at least 8 characters long"),
});

export const deleteAccountSchema = z.object({
  username: z.string(),
  password: z.string(),
});
