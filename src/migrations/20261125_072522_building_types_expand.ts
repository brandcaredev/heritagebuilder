import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."search" ALTER COLUMN "building_type_id" DROP NOT NULL;
  ALTER TABLE "payload"."buildings_rels" ADD COLUMN "building_types_id" integer;
  ALTER TABLE "payload"."_buildings_v_rels" ADD COLUMN "building_types_id" integer;
  ALTER TABLE "payload"."search_rels" ADD COLUMN "building_types_id" integer;
  ALTER TABLE "payload"."buildings_rels" ADD CONSTRAINT "buildings_rels_building_types_fk" FOREIGN KEY ("building_types_id") REFERENCES "payload"."building_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_buildings_v_rels" ADD CONSTRAINT "_buildings_v_rels_building_types_fk" FOREIGN KEY ("building_types_id") REFERENCES "payload"."building_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."search_rels" ADD CONSTRAINT "search_rels_building_types_fk" FOREIGN KEY ("building_types_id") REFERENCES "payload"."building_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "buildings_rels_building_types_id_idx" ON "payload"."buildings_rels" USING btree ("building_types_id");
  CREATE INDEX "_buildings_v_rels_building_types_id_idx" ON "payload"."_buildings_v_rels" USING btree ("building_types_id");
  CREATE INDEX "search_rels_building_types_id_idx" ON "payload"."search_rels" USING btree ("building_types_id");`)

  // Keep the Payload-generated schema DDL above intact. This SQL copies the
  // existing single type and mirrors writes while the old deployment is live.
  await db.execute(sql`
  INSERT INTO "payload"."buildings_rels" ("parent_id", "path", "order", "building_types_id")
  SELECT b."id", 'buildingTypes', 0, b."building_type_id"
  FROM "payload"."buildings" b
  WHERE b."building_type_id" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "payload"."buildings_rels" r
      WHERE r."parent_id" = b."id"
        AND r."path" = 'buildingTypes'
        AND r."building_types_id" = b."building_type_id"
    );

  INSERT INTO "payload"."_buildings_v_rels" ("parent_id", "path", "order", "building_types_id")
  SELECT v."id", 'version.buildingTypes', 0, v."version_building_type_id"
  FROM "payload"."_buildings_v" v
  WHERE v."version_building_type_id" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "payload"."_buildings_v_rels" r
      WHERE r."parent_id" = v."id"
        AND r."path" = 'version.buildingTypes'
        AND r."building_types_id" = v."version_building_type_id"
    );

  INSERT INTO "payload"."search_rels" ("parent_id", "path", "order", "building_types_id")
  SELECT s."id", 'buildingTypes', 0, s."building_type_id"
  FROM "payload"."search" s
  WHERE s."building_type_id" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "payload"."search_rels" r
      WHERE r."parent_id" = s."id"
        AND r."path" = 'buildingTypes'
        AND r."building_types_id" = s."building_type_id"
    );

  CREATE OR REPLACE FUNCTION "payload"."sync_building_types_to_plural"()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  DECLARE
    record_id integer := (to_jsonb(NEW) ->> 'id')::integer;
    building_type_id integer := NULLIF(to_jsonb(NEW) ->> TG_ARGV[0], '')::integer;
  BEGIN
    IF pg_trigger_depth() > 1 THEN
      RETURN NEW;
    END IF;

    EXECUTE format('DELETE FROM payload.%I WHERE parent_id = $1 AND path = $2', TG_ARGV[1])
      USING record_id, TG_ARGV[2];

    IF building_type_id IS NOT NULL THEN
      EXECUTE format(
        'INSERT INTO payload.%I (parent_id, path, "order", %I) VALUES ($1, $2, 0, $3)',
        TG_ARGV[1],
        TG_ARGV[3]
      ) USING record_id, TG_ARGV[2], building_type_id;
    END IF;

    RETURN NEW;
  END;
  $function$;

  CREATE OR REPLACE FUNCTION "payload"."sync_building_types_to_legacy"()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  DECLARE
    changed_row jsonb;
    record_id integer;
    relation_path text;
    building_type_id integer;
  BEGIN
    IF pg_trigger_depth() > 1 THEN
      RETURN NULL;
    END IF;

    changed_row := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
    relation_path := changed_row ->> 'path';
    IF relation_path <> TG_ARGV[2] THEN
      RETURN NULL;
    END IF;

    record_id := (changed_row ->> 'parent_id')::integer;
    EXECUTE format(
      'SELECT %I FROM payload.%I WHERE parent_id = $1 AND path = $2 ORDER BY "order" NULLS LAST, id LIMIT 1',
      TG_ARGV[1],
      TG_TABLE_NAME
    ) INTO building_type_id USING record_id, relation_path;

    EXECUTE format('UPDATE payload.%I SET %I = $1 WHERE id = $2', TG_ARGV[0], TG_ARGV[1])
      USING building_type_id, record_id;

    RETURN NULL;
  END;
  $function$;

  CREATE TRIGGER "buildings_sync_building_types_insert"
    AFTER INSERT ON "payload"."buildings"
    FOR EACH ROW EXECUTE FUNCTION "payload"."sync_building_types_to_plural"(
      'building_type_id', 'buildings_rels', 'buildingTypes', 'building_types_id'
    );
  CREATE TRIGGER "buildings_sync_building_types_update"
    AFTER UPDATE OF "building_type_id" ON "payload"."buildings"
    FOR EACH ROW WHEN (OLD."building_type_id" IS DISTINCT FROM NEW."building_type_id")
    EXECUTE FUNCTION "payload"."sync_building_types_to_plural"(
      'building_type_id', 'buildings_rels', 'buildingTypes', 'building_types_id'
    );
  CREATE TRIGGER "buildings_v_sync_building_types_insert"
    AFTER INSERT ON "payload"."_buildings_v"
    FOR EACH ROW EXECUTE FUNCTION "payload"."sync_building_types_to_plural"(
      'version_building_type_id', '_buildings_v_rels', 'version.buildingTypes', 'building_types_id'
    );
  CREATE TRIGGER "buildings_v_sync_building_types_update"
    AFTER UPDATE OF "version_building_type_id" ON "payload"."_buildings_v"
    FOR EACH ROW WHEN (OLD."version_building_type_id" IS DISTINCT FROM NEW."version_building_type_id")
    EXECUTE FUNCTION "payload"."sync_building_types_to_plural"(
      'version_building_type_id', '_buildings_v_rels', 'version.buildingTypes', 'building_types_id'
    );
  CREATE TRIGGER "search_sync_building_types_insert"
    AFTER INSERT ON "payload"."search"
    FOR EACH ROW EXECUTE FUNCTION "payload"."sync_building_types_to_plural"(
      'building_type_id', 'search_rels', 'buildingTypes', 'building_types_id'
    );
  CREATE TRIGGER "search_sync_building_types_update"
    AFTER UPDATE OF "building_type_id" ON "payload"."search"
    FOR EACH ROW WHEN (OLD."building_type_id" IS DISTINCT FROM NEW."building_type_id")
    EXECUTE FUNCTION "payload"."sync_building_types_to_plural"(
      'building_type_id', 'search_rels', 'buildingTypes', 'building_types_id'
    );

  CREATE TRIGGER "buildings_rels_sync_building_type"
    AFTER INSERT OR UPDATE OR DELETE ON "payload"."buildings_rels"
    FOR EACH ROW EXECUTE FUNCTION "payload"."sync_building_types_to_legacy"(
      'buildings', 'building_type_id', 'buildingTypes'
    );
  CREATE TRIGGER "buildings_v_rels_sync_building_type"
    AFTER INSERT OR UPDATE OR DELETE ON "payload"."_buildings_v_rels"
    FOR EACH ROW EXECUTE FUNCTION "payload"."sync_building_types_to_legacy"(
      '_buildings_v', 'version_building_type_id', 'version.buildingTypes'
    );
  CREATE TRIGGER "search_rels_sync_building_type"
    AFTER INSERT OR UPDATE OR DELETE ON "payload"."search_rels"
    FOR EACH ROW EXECUTE FUNCTION "payload"."sync_building_types_to_legacy"(
      'search', 'building_type_id', 'buildingTypes'
    );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TRIGGER IF EXISTS "buildings_sync_building_types_insert" ON "payload"."buildings";
  DROP TRIGGER IF EXISTS "buildings_sync_building_types_update" ON "payload"."buildings";
  DROP TRIGGER IF EXISTS "buildings_v_sync_building_types_insert" ON "payload"."_buildings_v";
  DROP TRIGGER IF EXISTS "buildings_v_sync_building_types_update" ON "payload"."_buildings_v";
  DROP TRIGGER IF EXISTS "search_sync_building_types_insert" ON "payload"."search";
  DROP TRIGGER IF EXISTS "search_sync_building_types_update" ON "payload"."search";
  DROP TRIGGER IF EXISTS "buildings_rels_sync_building_type" ON "payload"."buildings_rels";
  DROP TRIGGER IF EXISTS "buildings_v_rels_sync_building_type" ON "payload"."_buildings_v_rels";
  DROP TRIGGER IF EXISTS "search_rels_sync_building_type" ON "payload"."search_rels";
  DROP FUNCTION IF EXISTS "payload"."sync_building_types_to_plural"();
  DROP FUNCTION IF EXISTS "payload"."sync_building_types_to_legacy"();`)

  await db.execute(sql`
   ALTER TABLE "payload"."buildings_rels" DROP CONSTRAINT "buildings_rels_building_types_fk";
  
  ALTER TABLE "payload"."_buildings_v_rels" DROP CONSTRAINT "_buildings_v_rels_building_types_fk";
  
  ALTER TABLE "payload"."search_rels" DROP CONSTRAINT "search_rels_building_types_fk";
  
  DROP INDEX "payload"."buildings_rels_building_types_id_idx";
  DROP INDEX "payload"."_buildings_v_rels_building_types_id_idx";
  DROP INDEX "payload"."search_rels_building_types_id_idx";
  ALTER TABLE "payload"."search" ALTER COLUMN "building_type_id" SET NOT NULL;
  ALTER TABLE "payload"."buildings_rels" DROP COLUMN "building_types_id";
  ALTER TABLE "payload"."_buildings_v_rels" DROP COLUMN "building_types_id";
  ALTER TABLE "payload"."search_rels" DROP COLUMN "building_types_id";`)
}
