import { z } from "zod";

const createSessionSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const createOauthSessionSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, "Firebase ID Token is required"),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>["body"];
export type CreateOauthSessionInput = z.infer<typeof createOauthSessionSchema>["body"];

export { createSessionSchema, createOauthSessionSchema };
