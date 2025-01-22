import { z } from "zod";

import { LocaleType } from "@/lib/constans";
import { getNextLanguageCountySlug } from "@/lib/queries/county";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const countyRouter = createTRPCRouter({
  getLanguageCountySlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageCountySlug(slug, nextLang as LocaleType),
    ),
});
