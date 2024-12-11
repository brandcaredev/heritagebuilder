import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { youtubeLinksTable } from "@/server/db/schemas/youtubeSchema";
import { eq } from "drizzle-orm";

export const youtubeRouter = createTRPCRouter({
  getLinks: publicProcedure.query(async ({ ctx }) => {
    try {
      const links = await ctx.db.select().from(youtubeLinksTable);
      return links;
    } catch (error) {
      console.error("Error fetching YouTube links:", error);
      throw new Error("Failed to fetch YouTube links");
    }
  }),

  addLink: publicProcedure
    .input(
      z.object({
        title: z.string(),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(youtubeLinksTable).values({
          title: input.title,
          url: input.url,
        });
        return "YouTube link added successfully";
      } catch (error) {
        console.error("Error adding YouTube link:", error);
        throw new Error("Failed to add YouTube link");
      }
    }),

  deleteLink: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .delete(youtubeLinksTable)
          .where(eq(youtubeLinksTable.id, input.id));
        return "YouTube link deleted successfully";
      } catch (error) {
        console.error("Error deleting YouTube link:", error);
        throw new Error("Failed to delete YouTube link");
      }
    }),
});
