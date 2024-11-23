import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  text,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { buildingsTable, citiesTable, regionsTable } from ".";
import { countiesTable } from "./countySchema";

// country
export const countriesTable = pgTable("Country", {
  id: text("id").primaryKey(),
  img: text("img").notNull(),
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
  data: many(countriesDataTable),
  counties: many(countiesTable),
}));

//translation
export const countriesDataTable = pgTable(
  "CountryData",
  {
    countryid: text("countryid").notNull(),
    language: text("language").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    unq: unique().on(table.language, table.slug),
    prk: primaryKey({ columns: [table.countryid, table.language] }),
  }),
);

export const countryDataRelations = relations(
  countriesDataTable,
  ({ one }) => ({
    country: one(countriesTable, {
      fields: [countriesDataTable.countryid],
      references: [countriesTable.id],
    }),
  }),
);
