import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { and, desc, eq, or, sql } from "drizzle-orm";
import {
  BuildingDataInsertSchema,
  BuildingSchema,
} from "@/server/db/zodSchemaTypes";
import {
  buildingDataTable,
  buildingsTable,
  citiesDataTable,
  countriesDataTable,
  countiesDataTable,
  citiesTable,
  countiesTable,
} from "@/server/db/schemas";
import { TRPCError } from "@trpc/server";
import { getURL, mergeLanguageData } from "@/lib/utils";
import { db } from "@/server/db";

import { Resend } from "resend";
import { env } from "@/env";
const getApprovalTemplate = (name: string, url: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Building Approved</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #343e27;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }
        .link-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #343e27;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .link-btn:hover {
            background-color: #6a573a;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Good News! 🎉</h1>
        <div class="content">
            <p>We are pleased to inform you that your building <strong>${name}</strong> has been successfully approved!</p>
            <p>You can now view and manage your building by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${url}" class="link-btn">View Building</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Thank you for being part of Heritage Builder!</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Heritage Builder. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const resend = new Resend(env.RESEND_API_KEY);

export const buildingRouter = createTRPCRouter({
  getAcceptedBuildings: publicProcedure
    .input(z.object({ lang: z.string() }))
    .query(async ({ input: { lang } }) => {
      const buildings = await db.query.buildingsTable.findMany({
        where: eq(buildingsTable.status, "approved"),
        with: {
          county: {
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
            columns: {
              position: false,
            },
          },
          country: {
            with: {
              data: {
                where: or(
                  eq(countriesDataTable.language, lang),
                  eq(countriesDataTable.language, "hu"),
                ),
                columns: {
                  name: true,
                  language: true,
                },
              },
            },
          },
          city: {
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
            columns: {
              position: false,
            },
          },
          data: {
            // get the requested language and hungarian which is the fallback
            where: or(
              eq(buildingDataTable.language, lang),
              eq(buildingDataTable.language, "hu"),
            ),
          },
        },
        limit: 6,
        orderBy: [desc(buildingsTable.createdAt)],
      });

      const buildingsMapped = buildings.map((building) => ({
        ...mergeLanguageData(building, lang),
        city: mergeLanguageData(building.city, lang),
        country: mergeLanguageData(building.country, lang),
        county: mergeLanguageData(building.county, lang),
      }));
      return buildingsMapped;
    }),
  getBuildingBySlug: publicProcedure
    .input(z.object({ slug: z.string(), lang: z.string() }))
    .query(async ({ input: { lang, slug }, ctx }) => {
      // first we need the id of the building matching the slug
      const buildingData = await ctx.db.query.buildingDataTable.findFirst({
        where: and(
          eq(buildingDataTable.slug, slug),
          eq(buildingDataTable.language, lang),
        ),
      });
      if (!buildingData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Building data was not found",
        });
      }
      // using that id we can get the building and the selected + fallback language data
      const building = await ctx.db.query.buildingsTable.findFirst({
        where: eq(buildingsTable.id, buildingData.buildingid),
        with: {
          data: {
            // get the requested language and hungarian which is the fallback
            where: or(
              eq(buildingDataTable.language, lang),
              eq(buildingDataTable.language, "hu"),
            ),
          },
        },
      });
      if (!building)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Building was not found",
        });
      const data = mergeLanguageData(building, lang);
      return data;
    }),
  createBuilding: publicProcedure
    .input(
      BuildingSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }).extend({
        en: BuildingDataInsertSchema.omit({ buildingid: true }).optional(),
        hu: BuildingDataInsertSchema.omit({ buildingid: true }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { en, hu, ...baseData } = input;
      try {
        await ctx.db.transaction(async (tx) => {
          const resp = await tx
            .insert(buildingsTable)
            .values([baseData])
            .returning({ buildingid: buildingsTable.id });
          const buildingid = resp[0]?.buildingid!;
          if (en) {
            await tx.insert(buildingDataTable).values([
              { ...en, buildingid },
              { ...hu, buildingid },
            ]);
          } else {
            await tx.insert(buildingDataTable).values([{ ...hu, buildingid }]);
          }
        });
        return "Building successfully created";
      } catch (error) {
        console.error("Error creating building - createBuilding:", error);
        throw new Error("Error creating building");
      }
    }),
  getPendingBuildings: publicProcedure.query(async ({ ctx }) => {
    try {
      const buildings = await ctx.db.query.buildingsTable.findMany({
        where: eq(buildingsTable.status, "pending"),
        with: {
          city: {
            with: {
              data: true,
            },
            extras: {
              x: sql<number>`ST_X(${citiesTable.position})`.as("x"),
              y: sql<number>`ST_Y(${citiesTable.position})`.as("y"),
            },
            columns: {
              position: false,
            },
          },
          country: {
            with: {
              data: true,
            },
          },
          county: {
            with: {
              data: true,
            },
            extras: {
              x: sql<number>`ST_X(${countiesTable.position})`.as("x"),
              y: sql<number>`ST_Y(${countiesTable.position})`.as("y"),
            },
            columns: {
              position: false,
            },
          },
          buildingType: {
            with: {
              data: true,
            },
          },
          data: true,
        },
      });

      return buildings.map((building) => ({
        ...building,
        country: {
          ...building.country,
          en: building.country.data.find((d) => d.language === "en"),
          hu: building.country.data.find((d) => d.language === "hu")!,
        },
        city: {
          ...building.city,
          position:
            building.city.x && building.city.y
              ? [building.city.x, building.city.y]
              : null,
          en: building.city.data.find((d) => d.language === "en"),
          hu: building.city.data.find((d) => d.language === "hu")!,
        },
        buildingType: {
          ...building.buildingType,
          en: building.buildingType.data.find((d) => d.language === "en"),
          hu: building.buildingType.data.find((d) => d.language === "hu")!,
        },
        county: {
          ...building.county,
          position:
            building.county.x && building.county.y
              ? [building.county.x, building.county.y]
              : null,
          en: building.county.data.find((d) => d.language === "en"),
          hu: building.county.data.find((d) => d.language === "hu")!,
        },
        en: building.data.find((d) => d.language === "en"),
        hu: building.data.find((d) => d.language === "hu")!,
      }));
    } catch (error) {
      console.error("Error fetching pending buildings:", error);
      throw new Error("Failed to fetch pending buildings");
    }
  }),
  approveBuilding: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(buildingsTable)
          .set({ status: "approved" })
          .where(eq(buildingsTable.id, input.id));
        const data = await ctx.db.query.buildingsTable.findFirst({
          where: eq(buildingsTable.id, input.id),
          columns: { creatoremail: true },
          with: {
            data: {
              columns: { slug: true, name: true },
              where: eq(buildingDataTable.language, "hu"),
            },
          },
        });
        if (data?.creatoremail) {
          await resend.emails.send({
            from: "Heritage Builder <noreply@heritagebuilder.eu>",
            to: [data.creatoremail],
            subject: `Your building ${data.data[0]!.name} has been approved`,
            html: getApprovalTemplate(
              data.data[0]!.name,
              `${getURL()}building/${data.data[0]!.slug}`,
            ),
          });
        }
        return "Building approved successfully";
      } catch (error) {
        console.error("Error approving building:", error);
        throw new Error("Failed to approve building");
      }
    }),
  updateBuilding: publicProcedure
    .input(
      BuildingSchema.omit({
        createdAt: true,
        updatedAt: true,
      }).extend({
        en: BuildingDataInsertSchema.omit({ buildingid: true }).optional(),
        hu: BuildingDataInsertSchema.omit({ buildingid: true }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { en, hu, id, ...baseData } = input;
      try {
        await ctx.db.transaction(async (tx) => {
          await tx
            .update(buildingsTable)
            .set(baseData)
            .where(sql`${buildingsTable.id} = ${id}`);
          if (en) {
            await tx
              .update(buildingDataTable)
              .set(en)
              .where(
                and(
                  eq(buildingDataTable.buildingid, id),
                  eq(buildingDataTable.language, "en"),
                ),
              );
          }
          await tx
            .update(buildingDataTable)
            .set(hu)
            .where(
              and(
                eq(buildingDataTable.buildingid, id),
                eq(buildingDataTable.language, "hu"),
              ),
            );
        });
        return "Building successfully created";
      } catch (error) {
        console.error("Error creating building - createBuilding:", error);
        throw new Error("Error creating building");
      }
    }),
  getLanguageBuildingSlug: publicProcedure
    .input(
      z.object({ slug: z.string(), lang: z.string(), nextLang: z.string() }),
    )
    .query(async ({ input: { slug, lang, nextLang }, ctx }) => {
      const buildingData = await ctx.db.query.buildingDataTable.findFirst({
        where: and(
          eq(buildingDataTable.slug, slug),
          eq(buildingDataTable.language, lang),
        ),
        columns: {
          buildingid: true,
        },
      });
      if (!buildingData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Building data was not found",
        });
      const nextLangBuildingData =
        await ctx.db.query.buildingDataTable.findFirst({
          where: and(
            eq(buildingDataTable.buildingid, buildingData.buildingid),
            eq(buildingDataTable.language, nextLang),
          ),
          columns: {
            slug: true,
          },
        });
      if (!nextLangBuildingData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Next building data was not found",
        });
      return nextLangBuildingData.slug;
    }),
});
