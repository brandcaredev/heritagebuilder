import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'
import {
  createBuildingTypeSyncTriggers,
  dropBuildingTypeSyncTriggers,
} from './20261125_072522_building_types_expand'

const buildingTypeFields = [
  ['buildings', 'buildings_rels', 'building_type_id', 'buildingTypes'],
  ['_buildings_v', '_buildings_v_rels', 'version_building_type_id', 'version.buildingTypes'],
  ['search', 'search_rels', 'building_type_id', 'buildingTypes'],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await dropBuildingTypeSyncTriggers(db)

  for (const [recordTable, relationTable, legacyColumn, path] of buildingTypeFields) {
    const records = sql`"payload".${sql.identifier(recordTable)}`
    const relations = sql`"payload".${sql.identifier(relationTable)}`
    const legacyType = sql`record.${sql.identifier(legacyColumn)}`

    // Preserve legacy types for records that have no selection in the new field.
    await db.execute(sql`
      INSERT INTO ${relations} (parent_id, path, "order", building_types_id)
      SELECT record.id, ${path}, 0, ${legacyType}
      FROM ${records} AS record
      WHERE ${legacyType} IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM ${relations} AS relation
          WHERE relation.parent_id = record.id
            AND relation.path = ${path}
            AND relation.building_types_id IS NOT NULL
        );
    `)

    // Keep the earliest row for each type so distinct selections keep their order.
    await db.execute(sql`
      WITH ranked AS (
        SELECT id, row_number() OVER (
          PARTITION BY parent_id, building_types_id
          ORDER BY "order" NULLS LAST, id
        ) AS duplicate_rank
        FROM ${relations}
        WHERE path = ${path} AND building_types_id IS NOT NULL
      )
      DELETE FROM ${relations} AS relation
      USING ranked
      WHERE relation.id = ranked.id AND ranked.duplicate_rank > 1;
    `)
  }

  // PostgreSQL also removes each column's foreign key and index.
  await db.execute(sql`
    ALTER TABLE "payload"."buildings" DROP COLUMN "building_type_id";
    ALTER TABLE "payload"."_buildings_v" DROP COLUMN "version_building_type_id";
    ALTER TABLE "payload"."search" DROP COLUMN "building_type_id";
    CREATE UNIQUE INDEX "buildings_rels_unique_building_type"
      ON "payload"."buildings_rels" ("parent_id", "building_types_id") WHERE "path" = 'buildingTypes';
    CREATE UNIQUE INDEX "_buildings_v_rels_unique_building_type"
      ON "payload"."_buildings_v_rels" ("parent_id", "building_types_id") WHERE "path" = 'version.buildingTypes';
    CREATE UNIQUE INDEX "search_rels_unique_building_type"
      ON "payload"."search_rels" ("parent_id", "building_types_id") WHERE "path" = 'buildingTypes';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload"."buildings_rels_unique_building_type";
    DROP INDEX "payload"."_buildings_v_rels_unique_building_type";
    DROP INDEX "payload"."search_rels_unique_building_type";
    ALTER TABLE "payload"."buildings" ADD COLUMN "building_type_id" integer;
    ALTER TABLE "payload"."_buildings_v" ADD COLUMN "version_building_type_id" integer;
    ALTER TABLE "payload"."search" ADD COLUMN "building_type_id" integer;
    ALTER TABLE "payload"."buildings" ADD CONSTRAINT "buildings_building_type_id_building_types_id_fk"
      FOREIGN KEY ("building_type_id") REFERENCES "payload"."building_types" ("id") ON DELETE SET NULL;
    ALTER TABLE "payload"."_buildings_v" ADD CONSTRAINT "_buildings_v_version_building_type_id_building_types_id_fk"
      FOREIGN KEY ("version_building_type_id") REFERENCES "payload"."building_types" ("id") ON DELETE SET NULL;
    ALTER TABLE "payload"."search" ADD CONSTRAINT "search_building_type_id_building_types_id_fk"
      FOREIGN KEY ("building_type_id") REFERENCES "payload"."building_types" ("id") ON DELETE SET NULL;
    CREATE INDEX "buildings_building_type_idx" ON "payload"."buildings" ("building_type_id");
    CREATE INDEX "_buildings_v_version_version_building_type_idx" ON "payload"."_buildings_v" ("version_building_type_id");
    CREATE INDEX "search_building_type_idx" ON "payload"."search" ("building_type_id");
  `)

  for (const [recordTable, relationTable, legacyColumn, path] of buildingTypeFields) {
    await db.execute(sql`
      WITH first_types AS (
        SELECT DISTINCT ON (parent_id) parent_id, building_types_id
        FROM "payload".${sql.identifier(relationTable)}
        WHERE path = ${path} AND building_types_id IS NOT NULL
        ORDER BY parent_id, "order" NULLS LAST, id
      )
      UPDATE "payload".${sql.identifier(recordTable)} AS record
      SET ${sql.identifier(legacyColumn)} = first_types.building_types_id
      FROM first_types
      WHERE record.id = first_types.parent_id;
    `)
  }

  await createBuildingTypeSyncTriggers(db)
}
