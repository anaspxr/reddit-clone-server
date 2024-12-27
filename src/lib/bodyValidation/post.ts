import z from "zod";

export const textPostValidation = z.object({
  title: z.string().min(1).max(300),
  body: z.string().max(5000).optional(),
  community: z.string().nullable().optional(),
});

export const mediaPostValidation = z.object({
  title: z.string().min(1).max(300),
  community: z.string().nullable().optional(),
  media: z.array(z.string()).min(1).max(5),
});
