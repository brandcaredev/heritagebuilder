import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { usersTable } from "@/server/db/schemas";
import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.db
          .insert(usersTable)
          .values({ email: input.email, role: "user" });

        return user[0];
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create user",
        });
      }
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.query.usersTable.findFirst({
        where: eq(usersTable.email, input.email),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),
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
