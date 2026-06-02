import { z } from "zod";

export const createCallSchema = z.object({
  body: z.object({
    callId: z.string().trim().min(1).max(200),
    channelId: z.string().trim().min(1).max(200),
    participantId: z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid participant id"),
  }),
});
