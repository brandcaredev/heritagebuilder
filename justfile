set shell := ["sh", "-cu"]

db_url := env_var_or_default("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:8832/postgres")
images_dir := env_var_or_default("HERITAGE_IMAGES_DIR", "/Users/robertcsis/Desktop/heritagebuilder_images")

seed: seed-sql seed-images

seed-sql:
  psql "{{db_url}}" -f supabase/seed.sql
  psql "{{db_url}}" -f supabase/seed.payload.sql

seed-images:
  test -d "{{images_dir}}"
  supabase --experimental --yes storage cp --local "{{images_dir}}/84a4e4cce09b93a11a099c900ab74a668a6eaf62.jpg" ss:///supabase-payload/country/romania.jpg || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/country/serbia.png" ss:///supabase-payload/country/serbia.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/country/ukraine.png" ss:///supabase-payload/country/ukraine.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/country/slovakia.png" ss:///supabase-payload/country/slovakia.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildingtypes/temples.png" ss:///supabase-payload/building-type/temples.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildingtypes/fortresses.png" ss:///supabase-payload/building-type/fortresses.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildingtypes/castles.png" ss:///supabase-payload/building-type/castles.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildingtypes/common-buildings.png" ss:///supabase-payload/building-type/common-buildings.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildingtypes/common-buildings.png" ss:///supabase-payload/building-type/monuments.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildingtypes/industrial-buildings.png" ss:///supabase-payload/building-type/industrial-buildings.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildingtypes/residential-buildings.png" ss:///supabase-payload/building-type/residential-buildings.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildings/2.png" ss:///supabase-payload/building/2.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildings/3.png" ss:///supabase-payload/building/3.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildings/4.png" ss:///supabase-payload/building/4.png || true
  supabase --experimental --yes storage cp --local "{{images_dir}}/buildings/5.png" ss:///supabase-payload/building/5.png || true
