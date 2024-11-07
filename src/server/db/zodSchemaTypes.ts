import { z } from "zod";
import {
  buildingsTable,
  regionsTable,
  countriesTable,
  citiesTable,
  buildingTypesTable,
} from "./schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const CountrySchema = createSelectSchema(countriesTable).extend({
  position: z.tuple([z.number(), z.number()]).nullable(),
});
export type Country = z.infer<typeof CountrySchema>;
export type CountryExtended = Country & {
  regions: Region[];
  cities: City[];
  buildings: Building[];
};

export const RegionSchema = createSelectSchema(regionsTable);
export type Region = z.infer<typeof RegionSchema>;

export const CitySchema = createSelectSchema(citiesTable);
export type City = z.infer<typeof CitySchema>;

export const BuildingSchema = createSelectSchema(buildingsTable);
export type Building = z.infer<typeof BuildingSchema>;

export const BuildingTypeSchema = createSelectSchema(buildingTypesTable);
export type BuildingTypes = z.infer<typeof BuildingTypeSchema>;
