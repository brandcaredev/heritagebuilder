import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(env.RESEND_API_KEY);

export const userRouter = createTRPCRouter({
  addToNewsletter: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      await resend.contacts.create({
        email: input,
        unsubscribed: false,
        audienceId: "97368375-bc58-4827-9e31-b11ded3b8159",
      });

      return true;
    }),
});
