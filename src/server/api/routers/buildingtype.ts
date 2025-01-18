import { LocaleType } from "@/lib/constans";
import { getNextLanguageBuildingTypeSlug } from "@/lib/queries/building-type";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const buildingTypeRouter = createTRPCRouter({
  getLanguageBuildingTypeSlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageBuildingTypeSlug(slug, nextLang as LocaleType),
    ),
});
