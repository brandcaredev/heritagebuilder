// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import { integer, serial, timestamp, pgTable, text } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const countries = pgTable("Country", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique(),
  name: text("name"),
  img: text("img"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const countriesRelations = relations(countries, ({ many }) => ({
  buildings: many(buildings),
}));

export const regions = pgTable("Region", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique(),
  name: text("name"),
  countryid: integer("countryid").references(() => countries.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const regionsRelations = relations(regions, ({ many, one }) => ({
  buildings: many(buildings),
  country: one(countries, {
    fields: [regions.countryid],
    references: [countries.id],
  }),
}));

export const cities = pgTable("City", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique(),
  name: text("name"),
  countryid: integer("countryid").references(() => countries.id),
  regionid: integer("regionid").references(() => regions.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const citiesRelations = relations(cities, ({ many, one }) => ({
  buildings: many(buildings),
  country: one(countries, {
    fields: [cities.countryid],
    references: [countries.id],
  }),
  region: one(regions, {
    fields: [cities.regionid],
    references: [regions.id],
  }),
}));

export const buildings = pgTable("Building", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique(),
  name: text("name"),
  img: text("img"),
  cityid: integer("cityid").references(() => cities.id),
  buildingtypeid: integer("buildingtypeid").references(() => buildingTypes.id),
  countryid: integer("countryid").references(() => countries.id),
  regionid: integer("regionid").references(() => regions.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const buildingRelations = relations(buildings, ({ one }) => ({
  author: one(cities, { fields: [buildings.cityid], references: [cities.id] }),
  buildingType: one(buildingTypes, {
    fields: [buildings.buildingtypeid],
    references: [buildingTypes.id],
  }),
  country: one(countries, {
    fields: [buildings.countryid],
    references: [countries.id],
  }),
  region: one(regions, {
    fields: [buildings.regionid],
    references: [regions.id],
  }),
  city: one(cities, {
    fields: [buildings.cityid],
    references: [cities.id],
  }),
}));

export const buildingTypes = pgTable("BuildingType", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique(),
  name: text("name"),
  img: text("img"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const buildingTypesRelations = relations(buildingTypes, ({ many }) => ({
  buildings: many(buildings),
}));
