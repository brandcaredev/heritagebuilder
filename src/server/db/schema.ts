// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  integer,
  serial,
  timestamp,
  pgTable,
  text,
  geometry,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const countriesTable = pgTable("Country", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  img: text("img").notNull(),
  position: geometry("location", {
    type: "point",
    mode: "tuple",
    srid: 4326,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const countriesRelations = relations(countriesTable, ({ many }) => ({
  buildings: many(buildingsTable),
  regions: many(regionsTable),
  cities: many(citiesTable),
}));

export const regionsTable = pgTable("Region", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  countryid: integer("countryid")
    .references(() => countriesTable.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const regionsRelations = relations(regionsTable, ({ many, one }) => ({
  buildings: many(buildingsTable),
  country: one(countriesTable, {
    fields: [regionsTable.countryid],
    references: [countriesTable.id],
  }),
}));

export const citiesTable = pgTable("City", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  countryid: integer("countryid")
    .references(() => countriesTable.id)
    .notNull(),
  regionid: integer("regionid")
    .references(() => regionsTable.id)
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
  region: one(regionsTable, {
    fields: [citiesTable.regionid],
    references: [regionsTable.id],
  }),
}));

export const buildingsTable = pgTable("Building", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  img: text("img").notNull(),
  cityid: integer("cityid")
    .references(() => citiesTable.id)
    .notNull(),
  buildingtypeid: integer("buildingtypeid").references(
    () => buildingTypesTable.id,
  ),
  countryid: integer("countryid").references(() => countriesTable.id),
  regionid: integer("regionid").references(() => regionsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const buildingRelations = relations(buildingsTable, ({ one }) => ({
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
  region: one(regionsTable, {
    fields: [buildingsTable.regionid],
    references: [regionsTable.id],
  }),
  city: one(citiesTable, {
    fields: [buildingsTable.cityid],
    references: [citiesTable.id],
  }),
}));

export const buildingTypesTable = pgTable("BuildingType", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
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
  }),
);
