import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { LocaleType } from "@/lib/constans";
import {
  getNextLanguageBuildingSlug,
  searchBuildings,
} from "@/lib/queries/building";

export const buildingRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ q: z.string(), lang: z.string() }))
    .query(
      async ({ input: { q, lang } }) =>
        (await searchBuildings(q, lang as LocaleType)).buildings,
    ),
  getLanguageBuildingSlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageBuildingSlug(slug, nextLang as LocaleType),
    ),
});
