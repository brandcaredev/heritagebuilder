import { z } from "zod";
import {
  regionsTable,
  countriesTable,
  citiesTable,
  buildingTypesTable,
  buildingDataTable,
  countriesDataTable,
  regionsDataTable,
  citiesDataTable,
  buildingTypesDataTable,
  countiesTable,
  countiesDataTable,
} from "./schemas";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type locales } from "@/lib/constans";

// country
export const CountryDataSchema = createSelectSchema(countriesDataTable);
export const CountrySchema = createSelectSchema(countriesTable);
export type CountryData = z.infer<typeof CountryDataSchema>;
export type Country = z.infer<typeof CountrySchema> & CountryData;
export type CountryExtended = Country & {
  counties: County[];
  cities: City[];
  buildings: IBuilding[];
};

// ------------------------------------------------

// region
export const RegionDataSchema = createSelectSchema(regionsDataTable);
export const RegionSchema = createSelectSchema(regionsTable);
export type RegionData = z.infer<typeof RegionDataSchema>;
export type Region = z.infer<typeof RegionSchema> & RegionData;

// ------------------------------------------------

// county
export const CountyDataSchema = createSelectSchema(countiesDataTable);
export const CountySchema = createSelectSchema(countiesTable);
export const CountyInsertSchema = createInsertSchema(countiesTable);
export const CountyDataInsertSchema = createInsertSchema(countiesDataTable);
export const CountyCreateSchema = CountyInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  en: CountyDataInsertSchema.omit({ countyid: true }),
  hu: CountyDataInsertSchema.omit({ countyid: true }),
});
export type CountyData = z.infer<typeof CountyDataSchema>;
export type County = z.infer<typeof CountySchema> & CountyData;
export type CountyInsert = z.infer<typeof CountyInsertSchema>;
export type CountyDataInsert = z.infer<typeof CountyDataInsertSchema>;
export type CountyCreate = z.infer<typeof CountyCreateSchema>;

// ------------------------------------------------

// city
export const CityDataSchema = createSelectSchema(citiesDataTable);
export const CitySchema = createSelectSchema(citiesTable);
export const CityInsertSchema = createInsertSchema(citiesTable);
export const CityDataInsertSchema = createInsertSchema(citiesDataTable);
export const CityCreateSchema = CityInsertSchema.omit({
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

// ------------------------------------------------

// building
export const BuildingSchema = z.object({
  id: z.number(),
  featuredImage: z.string(),
  images: z.array(z.string()),
  disabled: z.boolean(),
  position: z.tuple([z.number(), z.number()]),
  cityid: z.number(),
  buildingtypeid: z.number(),
  countryid: z.string(),
  countyid: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
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
