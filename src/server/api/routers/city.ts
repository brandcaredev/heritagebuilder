import { z } from "zod";

import { LocaleType } from "@/lib/constans";
import { getNextLanguageCitySlug } from "@/lib/queries/city";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const cityRouter = createTRPCRouter({
  getLanguageCitySlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageCitySlug(slug, nextLang as LocaleType),
    ),
});
