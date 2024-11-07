import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { countriesTable } from "~/server/db/schema";

export const countryRouter = createTRPCRouter({
  getCountries: publicProcedure.input(z.undefined()).query(async ({ ctx }) => {
    const countries = await ctx.db.query.countriesTable.findMany();
    return countries;
  }),
  getCountryBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const country = await ctx.db.query.countriesTable.findFirst({
        where: eq(countriesTable.slug, input.slug),
        with: {
          regions: true,
          cities: true,
          buildings: true,
        },
      });
      return country;
    }),
});
