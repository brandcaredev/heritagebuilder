import { z } from "zod";
import {
  regionsTable,
  countriesTable,
  buildingTypesTable,
  buildingDataTable,
  countriesDataTable,
  regionsDataTable,
  citiesDataTable,
  buildingTypesDataTable,
  countiesDataTable,
} from "./schemas";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type locales } from "@/lib/constans";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../api/root";

// country
export const CountryDataSchema = createSelectSchema(countriesDataTable);
export const CountrySchema = createSelectSchema(countriesTable);
export type CountryData = z.infer<typeof CountryDataSchema>;
export type Country = z.infer<typeof CountrySchema> & CountryData;
export type CountryExtended = Country & {
  counties: County[];
  cities: City[];
  regions: Region[];
  buildings: IBuilding[];
};
export type CountryExtendedWithTranslations = Country & {
  counties: CountyWithTranslations[];
  cities: CityWithTranslations[];
  regions: RegionWithTranslations[];
};
// ------------------------------------------------

// region
export const RegionDataSchema = createSelectSchema(regionsDataTable);
export const RegionSchema = createSelectSchema(regionsTable);
export type RegionData = z.infer<typeof RegionDataSchema>;
export type Region = z.infer<typeof RegionSchema> & RegionData;
export type RegionWithTranslations = z.infer<typeof RegionSchema> &
  Record<keyof typeof locales, RegionData>;
// ------------------------------------------------

// county
export const CountySchema = z.object({
  id: z.number(),
  countryid: z.string(),
  regionid: z.number().nullable(),
  position: z.tuple([z.number(), z.number()]).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CountyDataSchema = createSelectSchema(countiesDataTable);
export const CountyDataInsertSchema = createInsertSchema(countiesDataTable);
export const CountyCreateSchema = CountySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  en: CountyDataInsertSchema.omit({ countyid: true }),
  hu: CountyDataInsertSchema.omit({ countyid: true }),
});
export type CountyData = z.infer<typeof CountyDataSchema>;
export type County = z.infer<typeof CountySchema> & CountyData;
export type CountyDataInsert = z.infer<typeof CountyDataInsertSchema>;
export type CountyCreate = z.infer<typeof CountyCreateSchema>;
export type CountyWithTranslations = z.infer<typeof CountySchema> &
  Record<keyof typeof locales, CountyData>;

// ------------------------------------------------

// city
export const CitySchema = z.object({
  id: z.number(),
  countryid: z.string(),
  countyid: z.number(),
  position: z.tuple([z.number(), z.number()]).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CityDataSchema = createSelectSchema(citiesDataTable);
export const CityDataInsertSchema = createInsertSchema(citiesDataTable);
export const CityCreateSchema = CitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  en: CityDataInsertSchema.omit({ cityid: true }),
  hu: CityDataInsertSchema.omit({ cityid: true }),
});
export type CityData = z.infer<typeof CityDataSchema>;
export type City = z.infer<typeof CitySchema> & CityData;
export type CityCreate = z.infer<typeof CityCreateSchema>;
export type CityWithTranslations = z.infer<typeof CitySchema> &
  Record<keyof typeof locales, CityData>;

// ------------------------------------------------

// building
export const BuildingSchema = z.object({
  id: z.number(),
  featuredImage: z.string(),
  images: z.array(z.string()),
  status: z.string(),
  position: z.tuple([z.number(), z.number()]),
  cityid: z.number(),
  buildingtypeid: z.number(),
  countryid: z.string(),
  countyid: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BuildingDataSchema = createSelectSchema(buildingDataTable);
export const BuildingDataInsertSchema = createInsertSchema(buildingDataTable);
export const BuildingCreateSchema = BuildingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  en: BuildingDataInsertSchema.omit({ buildingid: true }),
  hu: BuildingDataInsertSchema.omit({ buildingid: true }),
});
export type BuildingData = z.infer<typeof BuildingDataSchema>;
export type IBuilding = z.infer<typeof BuildingSchema> & BuildingData;
export type BuildingWithTranslations = IBuilding &
  Record<keyof typeof locales, BuildingData>;
export type BuildingCreate = z.infer<typeof BuildingCreateSchema>;

// ------------------------------------------------

// building types
export const BuildingTypeDataSchema = createSelectSchema(
  buildingTypesDataTable,
);
export const BuildingTypeSchema = createSelectSchema(buildingTypesTable);
export type BuildingTypeData = z.infer<typeof BuildingTypeDataSchema>;
export type BuildingTypes = z.infer<typeof BuildingTypeSchema> &
  BuildingTypeData;

// ------------------------------------------------
export type RouterOutput = inferRouterOutputs<AppRouter>;
