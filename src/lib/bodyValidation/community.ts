import z from "zod";

export const createCommunitySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Community name can only contain letters, numbers, and underscores"
    ),
  description: z.string().min(1).max(255),
  type: z.enum(["public", "private", "restricted"]),
});

export const communityNameSchema = z.object({
  name: z.string().min(1).max(20),
});

export const kickMemberSchema = z.object({
  communityName: z.string().min(1).max(20),
  username: z.string().min(1).max(20),
});
