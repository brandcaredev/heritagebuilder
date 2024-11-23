import { relations, sql } from "drizzle-orm";
import {
  boolean,
  geometry,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { citiesTable, countriesTable } from ".";
import { countiesTable } from "./countySchema";

export const buildingsTable = pgTable("Building", {
  id: serial("id").primaryKey(),
  featuredImage: text("featuredimage").notNull(),
  images: text("images").array().notNull(),
  disabled: boolean("disabled").default(true),
  position: geometry("position", {
    type: "point",
    mode: "tuple",
    srid: 4326,
  }).notNull(),
  cityid: integer("cityid")
    .references(() => citiesTable.id)
    .notNull(),
  buildingtypeid: integer("buildingtypeid")
    .references(() => buildingTypesTable.id)
    .notNull(),
  countryid: text("countryid")
    .references(() => countriesTable.id)
    .notNull(),
  countyid: integer("countyid")
    .references(() => countiesTable.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const buildingRelations = relations(buildingsTable, ({ one, many }) => ({
  author: one(citiesTable, {
    fields: [buildingsTable.cityid],
    references: [citiesTable.id],
  }),
  buildingType: one(buildingTypesTable, {
    fields: [buildingsTable.buildingtypeid],
    references: [buildingTypesTable.id],
  }),
  country: one(countriesTable, {
    fields: [buildingsTable.countryid],
    references: [countriesTable.id],
  }),
  county: one(countiesTable, {
    fields: [buildingsTable.countyid],
    references: [countiesTable.id],
  }),
  city: one(citiesTable, {
    fields: [buildingsTable.cityid],
    references: [citiesTable.id],
  }),
  data: many(buildingDataTable),
}));

export const buildingDataTable = pgTable(
  "BuildingData",
  {
    buildingid: integer("buildingid")
      .references(() => buildingsTable.id)
      .notNull(),
    language: text("language").notNull(),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    history: text("history").notNull(),
    style: text("style").notNull(),
    presentday: text("presentday").notNull(),
    famousresidents: text("famousresidents"),
    renovation: text("renovation"),
  },
  (table) => ({
    unq: unique().on(table.language, table.slug),
    prk: primaryKey({ columns: [table.buildingid, table.language] }),
  }),
);

export const buildingDataRelations = relations(
  buildingDataTable,
  ({ one }) => ({
    building: one(buildingsTable, {
      fields: [buildingDataTable.buildingid],
      references: [buildingsTable.id],
    }),
  }),
);

// building type
export const buildingTypesTable = pgTable("BuildingType", {
  id: serial("id").primaryKey(),
  img: text("img").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const buildingTypesRelations = relations(
  buildingTypesTable,
  ({ many }) => ({
    buildings: many(buildingsTable),
    data: many(buildingTypesDataTable),
  }),
);

export const buildingTypesDataTable = pgTable(
  "BuildingTypeData",
  {
    buildingtypeid: integer("buildingtypeid")
      .references(() => buildingTypesTable.id)
      .notNull(),
    language: text("languageid").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    unq: unique().on(table.language, table.slug),
    prk: primaryKey({ columns: [table.buildingtypeid, table.language] }),
  }),
);
export const buildingTypesDataRelations = relations(
  buildingTypesDataTable,
  ({ one }) => ({
    buildingType: one(buildingTypesTable, {
      fields: [buildingTypesDataTable.buildingtypeid],
      references: [buildingTypesTable.id],
    }),
  }),
);
