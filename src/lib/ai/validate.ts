import { z } from "zod";

export const aiGenerateRequestSchema = z.object({
  collection: z.string().min(1),
  docId: z.union([z.string().min(1), z.number()]).transform(String),
  locale: z.string().min(1),
  fieldPath: z.string().min(1),
  additionalInstructions: z.string().max(4000).optional(),
});

export type AIGenerateRequestInput = z.infer<typeof aiGenerateRequestSchema>;
