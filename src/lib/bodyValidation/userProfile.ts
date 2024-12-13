import z from "zod";

export const displayNameSchema = z.object({
  displayName: z
    .string()
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Display name should only contain alphanumeric characters"
    )
    .min(3),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8, "Password should be at least 8 characters long"),
});
