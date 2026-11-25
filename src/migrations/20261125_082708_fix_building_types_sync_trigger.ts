import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
      'SELECT building_types_id FROM payload.%I WHERE parent_id = $1 AND path = $2 ORDER BY "order" NULLS LAST, id LIMIT 1',
      TG_TABLE_NAME
    ) INTO building_type_id USING record_id, relation_path;

    EXECUTE format('UPDATE payload.%I SET %I = $1 WHERE id = $2', TG_ARGV[0], TG_ARGV[1])
      USING building_type_id, record_id;

    RETURN NULL;
  END;
  $function$;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep the corrected trigger function in place if this migration is rolled back.
}
