import { and, eq, or } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  buildingDataTable,
  citiesDataTable,
  countiesDataTable,
  countriesDataTable,
  countriesTable,
} from "@/server/db/schemas";
import { TRPCError } from "@trpc/server";
import { mergeLanguageData } from "@/lib/utils";

export const countryRouter = createTRPCRouter({
  getCountries: publicProcedure
    .input(z.object({ lang: z.string() }))
    .query(async ({ ctx, input: { lang } }) => {
      const countries = await ctx.db.query.countriesTable.findMany({
        with: {
          data: {
            // get the requested language and hungarian which is the fallback
            where: or(
              eq(countriesDataTable.language, lang),
              eq(countriesDataTable.language, "hu"),
            ),
          },
        },
      });

      const countriesMapped = countries.map((country) => {
        const countrySelectLang = country.data.find(
          (data) => data.language === lang,
        );
        const countryDefaultLang = country.data.find(
          (data) => data.language === "hu",
        );
        if (!countryDefaultLang)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Country data was not found",
          });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, ...rest } = country;

        return {
          ...rest,
          ...countryDefaultLang,
          ...countrySelectLang,
        };
      });

      return countriesMapped;
    }),
  getCountryBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(async ({ input: { slug, lang }, ctx }) => {
      const countryData = await ctx.db.query.countriesDataTable.findFirst({
        where: and(
          eq(countriesDataTable.slug, slug),
          eq(countriesDataTable.language, lang),
        ),
      });
      if (!countryData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Country data was not found",
        });
      }
      const country = await ctx.db.query.countriesTable.findFirst({
        where: eq(countriesTable.id, countryData.countryid),
        with: {
          cities: {
            with: {
              data: {
                where: or(
                  eq(citiesDataTable.language, lang),
                  eq(citiesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                },
              },
            },
          },
          counties: {
            with: {
              data: {
                where: or(
                  eq(countiesDataTable.language, lang),
                  eq(countiesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                },
              },
            },
          },
          buildings: {
            columns: {
              featuredImage: true,
              buildingtypeid: true,
            },
            with: {
              data: {
                where: or(
                  eq(buildingDataTable.language, lang),
                  eq(buildingDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                  slug: true,
                },
              },
            },
          },
          data: {
            where: and(
              eq(countriesDataTable.slug, slug),
              eq(countriesDataTable.language, lang),
            ),
          },
        },
      });

      if (!country)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Country was not found",
        });
      const mergedCountry = mergeLanguageData(country, lang);
      const countryMapped = {
        counties: country.counties.map((county) => {
          const countyMapped = mergeLanguageData(county, lang);
          return {
            ...countyMapped,
          };
        }),
        cities: country.cities.map((city) => {
          const cityMapped = mergeLanguageData(city, lang);
          return {
            ...cityMapped,
          };
        }),
        buildings: country.buildings.map((building) => {
          const buildingMapped = mergeLanguageData(building, lang);
          return {
            ...buildingMapped,
          };
        }),
        ...mergedCountry,
      };

      return countryMapped;
    }),
});
