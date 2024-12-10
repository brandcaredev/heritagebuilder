import { relations, sql } from "drizzle-orm";
import {
  integer,
  serial,
  timestamp,
  pgTable,
  text,
  unique,
  primaryKey,
  geometry,
} from "drizzle-orm/pg-core";
import { buildingsTable, countriesTable, countiesTable } from ".";

export const citiesTable = pgTable("City", {
  id: serial("id").primaryKey(),
  countryid: text("countryid")
    .references(() => countriesTable.id)
    .notNull(),
  position: geometry("position", {
    type: "point",
    mode: "tuple",
    srid: 4326,
  }),
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

export const citiesRelations = relations(citiesTable, ({ many, one }) => ({
  buildings: many(buildingsTable),
  country: one(countriesTable, {
    fields: [citiesTable.countryid],
    references: [countriesTable.id],
  }),
  county: one(countiesTable, {
    fields: [citiesTable.countyid],
    references: [countiesTable.id],
  }),
  data: many(citiesDataTable),
}));

export const citiesDataTable = pgTable(
  "CityData",
  {
    cityid: integer("cityid")
      .references(() => citiesTable.id)
      .notNull(),
    language: text("language").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => ({
    unq: unique().on(table.language, table.slug),
    prk: primaryKey({ columns: [table.cityid, table.language] }),
  }),
);

export const citiesDataRelations = relations(citiesDataTable, ({ one }) => ({
  city: one(citiesTable, {
    fields: [citiesDataTable.cityid],
    references: [citiesTable.id],
  }),
}));
