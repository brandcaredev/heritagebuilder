import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("Users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
