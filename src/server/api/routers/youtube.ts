import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { youtubeLinksTable } from "@/server/db/schemas/youtubeSchema";
import { eq, sql } from "drizzle-orm";

export const youtubeRouter = createTRPCRouter({
  getLinks: publicProcedure.query(async ({ ctx }) => {
    try {
      const links = await ctx.db.select().from(youtubeLinksTable);
      return links.sort((a, b) => (a.sort || 0) - (b.sort || 0));
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
  updateOrder: publicProcedure
    .input(
      z
        .object({
          id: z.number(),
          sort: z.number(),
        })
        .array(),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.transaction(async (tx) => {
          await Promise.all(
            input.map(async (link) => {
              await tx
                .update(youtubeLinksTable)
                .set({ sort: link.sort })
                .where(sql`${youtubeLinksTable.id} = ${link.id}`);
            }),
          );
        });
        return "YouTube link order updated successfully";
      } catch (error) {
        console.error("Error updating YouTube link order:", error);
        throw new Error("Failed to update YouTube link order");
      }
    }),
  updateLink: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        url: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newLink = await ctx.db
          .update(youtubeLinksTable)
          .set({
            title: input.title,
            url: input.url,
          })
          .where(eq(youtubeLinksTable.id, input.id))
          .returning({
            id: youtubeLinksTable.id,
            sort: youtubeLinksTable.sort,
            url: youtubeLinksTable.url,
            title: youtubeLinksTable.title,
          });
        return newLink[0];
      } catch (error) {
        console.error("Error updating YouTube link:", error);
        throw new Error("Failed to update YouTube link");
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
