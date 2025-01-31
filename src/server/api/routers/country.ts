import { LocaleType } from "@/lib/constans";
import { getNextLanguageCountrySlug } from "@/lib/queries/country";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const countryRouter = createTRPCRouter({
  getLanguageCountrySlug: publicProcedure
    .input(z.object({ slug: z.string(), nextLang: z.string() }))
    .query(
      async ({ input: { slug, nextLang } }) =>
        await getNextLanguageCountrySlug(slug, nextLang as LocaleType),
    ),
});
