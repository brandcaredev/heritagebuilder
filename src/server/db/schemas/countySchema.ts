import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  text,
  serial,
  integer,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { buildingsTable, countriesTable, regionsTable } from ".";

export const countiesTable = pgTable("County", {
  id: serial("id").primaryKey(),
  countryid: text("countryid")
    .references(() => countriesTable.id)
    .notNull(),
  regionid: integer("regionid").references(() => regionsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const countyRelations = relations(countiesTable, ({ many, one }) => ({
  buildings: many(buildingsTable),
  country: one(countriesTable, {
    fields: [countiesTable.countryid],
    references: [countriesTable.id],
  }),
  data: many(countiesDataTable),
}));

export const countiesDataTable = pgTable(
  "CountyData",
  {
    countyid: integer("countyid")
      .references(() => countiesTable.id)
      .notNull(),
    language: text("language").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    unq: unique().on(table.language, table.slug),
    prk: primaryKey({ columns: [table.countyid, table.language] }),
  }),
);

export const countyDataRelations = relations(countiesDataTable, ({ one }) => ({
  region: one(countiesTable, {
    fields: [countiesDataTable.countyid],
    references: [countiesTable.id],
  }),
}));
