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
import { countriesTable, countiesTable } from ".";

export const regionsTable = pgTable("Region", {
  id: serial("id").primaryKey(),
  countryid: text("countryid")
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
  country: one(countriesTable, {
    fields: [regionsTable.countryid],
    references: [countriesTable.id],
  }),
  data: many(regionsDataTable),
  county: many(countiesTable),
}));

export const regionsDataTable = pgTable(
  "RegionData",
  {
    regionid: integer("regionid")
      .references(() => regionsTable.id)
      .notNull(),
    language: text("language").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    unq: unique().on(table.language, table.slug),
    prk: primaryKey({ columns: [table.regionid, table.language] }),
  }),
);

export const regionsDataRelations = relations(regionsDataTable, ({ one }) => ({
  region: one(regionsTable, {
    fields: [regionsDataTable.regionid],
    references: [regionsTable.id],
  }),
}));
