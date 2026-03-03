-- Payload seed data for local development.
-- Safe to re-run: inserts are guarded with WHERE NOT EXISTS / upserts.
--
-- Note: This seeds placeholder media rows (no actual files). Replace them later in the Payload
-- admin UI by uploading real images and updating the references on each document.

set search_path = payload, public, extensions;

do $$
begin
  if to_regclass('payload.countries_media') is null
    or to_regclass('payload.building_types') is null
    or to_regclass('payload.buildings') is null then
    raise notice 'Skipping seed.payload.sql: Payload schema is missing. Run `npm run migrate:dev` first, then re-run this seed.';
    return;
  end if;

-- ---------------------------------------------------------------------------
-- Placeholder media (countries / building types / buildings)
-- ---------------------------------------------------------------------------

insert into payload.countries_media (alt, filename, mime_type, filesize, width, height, url)
values
  ('Seed placeholder image', 'romania.jpg', 'image/png', 0, 1, 1, 'seed://countries/romania'),
  ('Seed placeholder image', 'serbia.png', 'image/png', 0, 1, 1, 'seed://countries/serbia'),
  ('Seed placeholder image', 'ukraine.png', 'image/png', 0, 1, 1, 'seed://countries/ukraine'),
  ('Seed placeholder image', 'slovakia.png', 'image/png', 0, 1, 1, 'seed://countries/slovakia')
on conflict (filename) do nothing;

insert into payload.building_types_media (alt, filename, mime_type, filesize, width, height, url)
values
  ('Seed placeholder image', 'temples.png', 'image/png', 0, 1, 1, 'seed://building-types/temples'),
  ('Seed placeholder image', 'fortresses.png', 'image/png', 0, 1, 1, 'seed://building-types/fortresses'),
  ('Seed placeholder image', 'castles.png', 'image/png', 0, 1, 1, 'seed://building-types/castles'),
  ('Seed placeholder image', 'common-buildings.png', 'image/png', 0, 1, 1, 'seed://building-types/public-buildings'),
  ('Seed placeholder image', 'industrial-buildings.png', 'image/png', 0, 1, 1, 'seed://building-types/industrial-buildings'),
  ('Seed placeholder image', 'residential-buildings.png', 'image/png', 0, 1, 1, 'seed://building-types/residential-buildings'),
  ('Seed placeholder image', 'monuments.png', 'image/png', 0, 1, 1, 'seed://building-types/monuments')
on conflict (filename) do nothing;

insert into payload.buildings_media (alt, filename, mime_type, filesize, width, height, url)
values
  ('Seed placeholder image', '2.png', 'image/png', 0, 1, 1, 'seed://buildings/cluj-st-michaels-church'),
  ('Seed placeholder image', '3.png', 'image/png', 0, 1, 1, 'seed://buildings/novi-sad-petrovaradin-fortress'),
  ('Seed placeholder image', '4.png', 'image/png', 0, 1, 1, 'seed://buildings/lviv-opera-house'),
  ('Seed placeholder image', '5.png', 'image/png', 0, 1, 1, 'seed://buildings/bratislava-castle')
on conflict (filename) do nothing;

-- ---------------------------------------------------------------------------
-- Countries (localized)
-- ---------------------------------------------------------------------------

insert into payload.countries (country_code, image_id, _status)
select
  'RO',
  (select id from payload.countries_media where filename = 'romania.jpg' limit 1),
  'published'::payload.enum_countries_status
where not exists (select 1 from payload.countries where country_code = 'RO');

insert into payload.countries (country_code, image_id, _status)
select
  'RS',
  (select id from payload.countries_media where filename = 'serbia.png' limit 1),
  'published'::payload.enum_countries_status
where not exists (select 1 from payload.countries where country_code = 'RS');

insert into payload.countries (country_code, image_id, _status)
select
  'UA',
  (select id from payload.countries_media where filename = 'ukraine.png' limit 1),
  'published'::payload.enum_countries_status
where not exists (select 1 from payload.countries where country_code = 'UA');

insert into payload.countries (country_code, image_id, _status)
select
  'SK',
  (select id from payload.countries_media where filename = 'slovakia.png' limit 1),
  'published'::payload.enum_countries_status
where not exists (select 1 from payload.countries where country_code = 'SK');

insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, id, 'Romania', 'romania' from payload.countries where country_code = 'RO'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, id, 'Románia', 'romania' from payload.countries where country_code = 'RO'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, id, 'Serbia', 'serbia' from payload.countries where country_code = 'RS'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, id, 'Szerbia', 'szerbia' from payload.countries where country_code = 'RS'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, id, 'Ukraine', 'ukraine' from payload.countries where country_code = 'UA'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, id, 'Ukrajna', 'ukrajna' from payload.countries where country_code = 'UA'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, id, 'Slovakia', 'slovakia' from payload.countries where country_code = 'SK'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.countries_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, id, 'Szlovákia', 'szlovakia' from payload.countries where country_code = 'SK'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

-- ---------------------------------------------------------------------------
-- Building types (localized)
-- ---------------------------------------------------------------------------

insert into payload.building_types (image_id, _status)
select
  (select id from payload.building_types_media where filename = 'temples.png' limit 1),
  'published'::payload.enum_building_types_status
where not exists (
  select 1
  from payload.building_types_locales l
  where l._locale = 'en'::payload._locales and l.slug = 'temples'
);

insert into payload.building_types (image_id, _status)
select
  (select id from payload.building_types_media where filename = 'fortresses.png' limit 1),
  'published'::payload.enum_building_types_status
where not exists (
  select 1
  from payload.building_types_locales l
  where l._locale = 'en'::payload._locales and l.slug = 'fortresses'
);

insert into payload.building_types (image_id, _status)
select
  (select id from payload.building_types_media where filename = 'castles.png' limit 1),
  'published'::payload.enum_building_types_status
where not exists (
  select 1
  from payload.building_types_locales l
  where l._locale = 'en'::payload._locales and l.slug = 'castles'
);

insert into payload.building_types (image_id, _status)
select
  (select id from payload.building_types_media where filename = 'common-buildings.png' limit 1),
  'published'::payload.enum_building_types_status
where not exists (
  select 1
  from payload.building_types_locales l
  where l._locale = 'en'::payload._locales and l.slug = 'public-buildings'
);

insert into payload.building_types (image_id, _status)
select
  (select id from payload.building_types_media where filename = 'industrial-buildings.png' limit 1),
  'published'::payload.enum_building_types_status
where not exists (
  select 1
  from payload.building_types_locales l
  where l._locale = 'en'::payload._locales and l.slug = 'industrial-buildings'
);

insert into payload.building_types (image_id, _status)
select
  (select id from payload.building_types_media where filename = 'residential-buildings.png' limit 1),
  'published'::payload.enum_building_types_status
where not exists (
  select 1
  from payload.building_types_locales l
  where l._locale = 'en'::payload._locales and l.slug = 'residential-buildings'
);

insert into payload.building_types (image_id, _status)
select
  (select id from payload.building_types_media where filename = 'monuments.png' limit 1),
  'published'::payload.enum_building_types_status
where not exists (
  select 1
  from payload.building_types_locales l
  where l._locale = 'en'::payload._locales and l.slug = 'monuments'
);

update payload.building_types bt
set image_id = (select id from payload.building_types_media where filename = 'monuments.png' limit 1)
where exists (
  select 1
  from payload.building_types_locales l
  where l._parent_id = bt.id
    and l._locale = 'en'::payload._locales
    and l.slug = 'monuments'
);

-- Tie locales to the row via the placeholder media filename (unique).
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'en'::payload._locales,
  bt.id,
  'Temples',
  'temples'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'temples.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'hu'::payload._locales,
  bt.id,
  'Templomok',
  'templomok'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'temples.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'en'::payload._locales,
  bt.id,
  'Fortresses',
  'fortresses'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'fortresses.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'hu'::payload._locales,
  bt.id,
  'Erődök',
  'erodok'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'fortresses.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'en'::payload._locales,
  bt.id,
  'Castles',
  'castles'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'castles.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'hu'::payload._locales,
  bt.id,
  'Várak',
  'varak'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'castles.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'en'::payload._locales,
  bt.id,
  'Public buildings',
  'public-buildings'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'monuments.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'hu'::payload._locales,
  bt.id,
  'Középületek',
  'kozepuletek'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'monuments.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'en'::payload._locales,
  bt.id,
  'Industrial buildings',
  'industrial-buildings'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'industrial-buildings.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'hu'::payload._locales,
  bt.id,
  'Ipari épületek',
  'ipari-epuletek'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'industrial-buildings.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'en'::payload._locales,
  bt.id,
  'Residential buildings',
  'residential-buildings'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'residential-buildings.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'hu'::payload._locales,
  bt.id,
  'Lakóépületek',
  'lakoepuletek'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'residential-buildings.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'en'::payload._locales,
  bt.id,
  'Monuments',
  'monuments'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'common-buildings.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.building_types_locales (_locale, _parent_id, name, slug)
select
  'hu'::payload._locales,
  bt.id,
  'Műemlékek',
  'muemlekek'
from payload.building_types bt
join payload.building_types_media m on m.id = bt.image_id
where m.filename = 'common-buildings.png'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

-- ---------------------------------------------------------------------------
-- Counties + Cities (localized)
-- ---------------------------------------------------------------------------

-- Romania: Cluj (RO-CJ) + Timiș (RO-TM)
insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'RO-CJ'::payload.enum_counties_code,
  st_setsrid(st_makepoint(23.590, 46.770), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'RO'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'RO-CJ'::payload.enum_counties_code
  );

insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'RO-TM'::payload.enum_counties_code,
  st_setsrid(st_makepoint(21.230, 45.750), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'RO'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'RO-TM'::payload.enum_counties_code
  );

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'Cluj County', 'cluj-county'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RO' and co.code = 'RO-CJ'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Cluj megye', 'cluj-megye'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RO' and co.code = 'RO-CJ'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'Timiș County', 'timis-county'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RO' and co.code = 'RO-TM'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Temes megye', 'temes-megye'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RO' and co.code = 'RO-TM'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(23.590, 46.770), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'RO-CJ'::payload.enum_counties_code
where c.country_code = 'RO'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'cluj-napoca'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Cluj-Napoca', 'cluj-napoca'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RO-CJ'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RO'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Kolozsvár', 'kolozsvar'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RO-CJ'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RO'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(21.230, 45.750), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'RO-TM'::payload.enum_counties_code
where c.country_code = 'RO'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'timisoara'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Timișoara', 'timisoara'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RO-TM'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RO'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Temesvár', 'temesvar'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RO-TM'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RO'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

-- Serbia: Beograd (RS-00) + Južnobački okrug (RS-06)
insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'RS-00'::payload.enum_counties_code,
  st_setsrid(st_makepoint(20.460, 44.810), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'RS'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'RS-00'::payload.enum_counties_code
  );

insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'RS-06'::payload.enum_counties_code,
  st_setsrid(st_makepoint(19.830, 45.270), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'RS'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'RS-06'::payload.enum_counties_code
  );

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'Belgrade', 'belgrade'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RS' and co.code = 'RS-00'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Belgrád', 'belgrad'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RS' and co.code = 'RS-00'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'South Bačka District', 'south-backa'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RS' and co.code = 'RS-06'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Dél-bácskai körzet', 'del-backa'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'RS' and co.code = 'RS-06'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(20.460, 44.810), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'RS-00'::payload.enum_counties_code
where c.country_code = 'RS'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'belgrade'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Belgrade', 'belgrade'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RS-00'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RS'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Belgrád', 'belgrad'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RS-00'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RS'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(19.840, 45.260), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'RS-06'::payload.enum_counties_code
where c.country_code = 'RS'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'novi-sad'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Novi Sad', 'novi-sad'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RS-06'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RS'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Újvidék', 'ujvidek'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'RS-06'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'RS'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

-- Ukraine: Lviv (lviv) + Kyiv city (kiev_city)
insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'lviv'::payload.enum_counties_code,
  st_setsrid(st_makepoint(24.030, 49.840), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'UA'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'lviv'::payload.enum_counties_code
  );

insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'kiev_city'::payload.enum_counties_code,
  st_setsrid(st_makepoint(30.520, 50.450), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'UA'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'kiev_city'::payload.enum_counties_code
  );

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'Lviv Oblast', 'lviv-oblast'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'UA' and co.code = 'lviv'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Lviv megye', 'lviv-megye'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'UA' and co.code = 'lviv'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'Kyiv (city)', 'kyiv-city'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'UA' and co.code = 'kiev_city'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Kijev (város)', 'kijev-varos'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'UA' and co.code = 'kiev_city'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(24.030, 49.840), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'lviv'::payload.enum_counties_code
where c.country_code = 'UA'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'lviv'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Lviv', 'lviv'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'lviv'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'UA'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Lemberg', 'lemberg'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'lviv'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'UA'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(30.520, 50.450), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'kiev_city'::payload.enum_counties_code
where c.country_code = 'UA'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'kyiv'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Kyiv', 'kyiv'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'kiev_city'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'UA'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Kijev', 'kijev'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'kiev_city'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'UA'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

-- Slovakia: Bratislavský (SKBL) + Košický kraj (SKKI)
insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'SKBL'::payload.enum_counties_code,
  st_setsrid(st_makepoint(17.110, 48.150), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'SK'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'SKBL'::payload.enum_counties_code
  );

insert into payload.counties (country_id, code, position, _status)
select
  c.id,
  'SKKI'::payload.enum_counties_code,
  st_setsrid(st_makepoint(21.260, 48.720), 4326),
  'published'::payload.enum_counties_status
from payload.countries c
where c.country_code = 'SK'
  and not exists (
    select 1 from payload.counties co
    where co.country_id = c.id and co.code = 'SKKI'::payload.enum_counties_code
  );

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'Bratislava Region', 'bratislava-region'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'SK' and co.code = 'SKBL'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Pozsony megye', 'pozsony-megye'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'SK' and co.code = 'SKBL'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, co.id, 'Košice Region', 'kosice-region'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'SK' and co.code = 'SKKI'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.counties_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, co.id, 'Kassa megye', 'kassa-megye'
from payload.counties co
join payload.countries c on c.id = co.country_id
where c.country_code = 'SK' and co.code = 'SKKI'::payload.enum_counties_code
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(17.110, 48.150), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'SKBL'::payload.enum_counties_code
where c.country_code = 'SK'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'bratislava'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Bratislava', 'bratislava'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'SKBL'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'SK'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Pozsony', 'pozsony'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'SKBL'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'SK'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

insert into payload.cities (country_id, county_id, position, _status)
select
  c.id,
  co.id,
  st_setsrid(st_makepoint(21.260, 48.720), 4326),
  'published'::payload.enum_cities_status
from payload.countries c
join payload.counties co on co.country_id = c.id and co.code = 'SKKI'::payload.enum_counties_code
where c.country_code = 'SK'
  and not exists (
    select 1 from payload.cities ci
    join payload.cities_locales l on l._parent_id = ci.id and l._locale = 'en'::payload._locales
    where ci.county_id = co.id and l.slug = 'kosice'
  );

insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'en'::payload._locales, ci.id, 'Košice', 'kosice'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'SKKI'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'SK'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;
insert into payload.cities_locales (_locale, _parent_id, name, slug)
select 'hu'::payload._locales, ci.id, 'Kassa', 'kassa'
from payload.cities ci
join payload.counties co on co.id = ci.county_id and co.code = 'SKKI'::payload.enum_counties_code
join payload.countries c on c.id = ci.country_id and c.country_code = 'SK'
on conflict (_locale, _parent_id) do update set name = excluded.name, slug = excluded.slug;

-- ---------------------------------------------------------------------------
-- Buildings (localized) + images rels
-- ---------------------------------------------------------------------------

-- 1) Cluj-Napoca: St. Michael's Church (Temples)
insert into payload.buildings (building_type_id, featured_image_id, position, country_id, county_id, city_id, _status)
select
  bt.id,
  bm.id,
  st_setsrid(st_makepoint(23.588, 46.771), 4326),
  c.id,
  co.id,
  ci.id,
  'published'::payload.enum_buildings_status
from payload.building_types bt
join payload.building_types_locales btl on btl._parent_id = bt.id and btl._locale = 'en'::payload._locales and btl.slug = 'temples'
join payload.buildings_media bm on bm.filename = '2.png'
join payload.countries c on c.country_code = 'RO'
join payload.counties co on co.country_id = c.id and co.code = 'RO-CJ'::payload.enum_counties_code
join payload.cities ci on ci.county_id = co.id
join payload.cities_locales cl on cl._parent_id = ci.id and cl._locale = 'en'::payload._locales and cl.slug = 'cluj-napoca'
where not exists (
  select 1 from payload.buildings_locales bl
  where bl._locale = 'en'::payload._locales and bl.slug = 'st-michaels-church-cluj'
);

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'en'::payload._locales,
  b.id,
  'St. Michael''s Church',
  'st-michaels-church-cluj',
  'A historic Gothic church in the heart of Cluj-Napoca.',
  'Built and expanded over centuries, it remains one of the city’s defining landmarks.',
  'Gothic architecture with later additions.',
  'An active church and a key cultural landmark.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '2.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'hu'::payload._locales,
  b.id,
  'Szent Mihály-templom',
  'szent-mihaly-templom-kolozsvar',
  'Történelmi gótikus templom Kolozsvár belvárosában.',
  'Évszázadok alatt épült és bővült, a város egyik legfontosabb jelképe.',
  'Gótikus stílus, későbbi kiegészítésekkel.',
  'Ma is működő templom és jelentős kulturális emlékhely.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '2.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_rels (parent_id, path, "order", buildings_media_id)
select
  b.id,
  'images',
  0,
  m.id
from payload.buildings b
join payload.buildings_media m on m.id = b.featured_image_id
where m.filename = '2.png'
  and not exists (
    select 1 from payload.buildings_rels r
    where r.parent_id = b.id and r.path = 'images' and r.buildings_media_id = m.id
  );

update payload.buildings b
set building_type_id = bt.id
from payload.buildings_locales bl
join (
  values
    ('st-michaels-church-cluj', 'temples'),
    ('petrovaradin-fortress', 'fortresses'),
    ('lviv-opera-house', 'public-buildings'),
    ('bratislava-castle', 'castles')
) s(building_slug, type_slug) on s.building_slug = bl.slug
join payload.building_types_locales btl on btl._locale = 'en'::payload._locales and btl.slug = s.type_slug
join payload.building_types bt on bt.id = btl._parent_id
where bl._parent_id = b.id
  and bl._locale = 'en'::payload._locales
  and b.building_type_id is null;

-- 2) Novi Sad: Petrovaradin Fortress (Fortresses)
insert into payload.buildings (building_type_id, featured_image_id, position, country_id, county_id, city_id, _status)
select
  bt.id,
  bm.id,
  st_setsrid(st_makepoint(19.860, 45.253), 4326),
  c.id,
  co.id,
  ci.id,
  'published'::payload.enum_buildings_status
from payload.building_types bt
join payload.building_types_locales btl on btl._parent_id = bt.id and btl._locale = 'en'::payload._locales and btl.slug = 'fortresses'
join payload.buildings_media bm on bm.filename = '3.png'
join payload.countries c on c.country_code = 'RS'
join payload.counties co on co.country_id = c.id and co.code = 'RS-06'::payload.enum_counties_code
join payload.cities ci on ci.county_id = co.id
join payload.cities_locales cl on cl._parent_id = ci.id and cl._locale = 'en'::payload._locales and cl.slug = 'novi-sad'
where not exists (
  select 1 from payload.buildings_locales bl
  where bl._locale = 'en'::payload._locales and bl.slug = 'petrovaradin-fortress'
);

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'en'::payload._locales,
  b.id,
  'Petrovaradin Fortress',
  'petrovaradin-fortress',
  'A monumental fortress overlooking the Danube near Novi Sad.',
  'Strategically expanded in the 17th–18th centuries, it became a key defensive site.',
  'Military fortification with bastions and underground tunnels.',
  'A major tourist attraction and cultural venue.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '3.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'hu'::payload._locales,
  b.id,
  'Péterváradi erőd',
  'petervaradi-erod',
  'Monumentális erőd a Duna fölött, Újvidék közelében.',
  'A 17–18. században stratégiai okokból bővítették, fontos védelmi szerepet töltött be.',
  'Bástyás erődrendszer föld alatti járatokkal.',
  'Ma népszerű turisztikai és kulturális helyszín.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '3.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_rels (parent_id, path, "order", buildings_media_id)
select
  b.id,
  'images',
  0,
  m.id
from payload.buildings b
join payload.buildings_media m on m.id = b.featured_image_id
where m.filename = '3.png'
  and not exists (
    select 1 from payload.buildings_rels r
    where r.parent_id = b.id and r.path = 'images' and r.buildings_media_id = m.id
  );

-- 3) Lviv: Opera House (Public buildings)
insert into payload.buildings (building_type_id, featured_image_id, position, country_id, county_id, city_id, _status)
select
  bt.id,
  bm.id,
  st_setsrid(st_makepoint(24.030, 49.843), 4326),
  c.id,
  co.id,
  ci.id,
  'published'::payload.enum_buildings_status
from payload.building_types bt
join payload.building_types_locales btl on btl._parent_id = bt.id and btl._locale = 'en'::payload._locales and btl.slug = 'public-buildings'
join payload.buildings_media bm on bm.filename = '4.png'
join payload.countries c on c.country_code = 'UA'
join payload.counties co on co.country_id = c.id and co.code = 'lviv'::payload.enum_counties_code
join payload.cities ci on ci.county_id = co.id
join payload.cities_locales cl on cl._parent_id = ci.id and cl._locale = 'en'::payload._locales and cl.slug = 'lviv'
where not exists (
  select 1 from payload.buildings_locales bl
  where bl._locale = 'en'::payload._locales and bl.slug = 'lviv-opera-house'
);

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'en'::payload._locales,
  b.id,
  'Lviv Opera House',
  'lviv-opera-house',
  'An iconic opera and ballet theatre in central Lviv.',
  'Opened in the early 20th century, it became one of the city’s cultural symbols.',
  'Historicist architecture with rich interior decoration.',
  'A leading performing arts venue in the region.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '4.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'hu'::payload._locales,
  b.id,
  'Lembergi Operaház',
  'lembergi-operahaz',
  'Ikonikus opera- és balettszínház Lviv belvárosában.',
  'A 20. század elején nyílt meg, és a város kulturális jelképe lett.',
  'Gazdagon díszített, historizáló építészet.',
  'A térség egyik kiemelt előadóművészeti helyszíne.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '4.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_rels (parent_id, path, "order", buildings_media_id)
select
  b.id,
  'images',
  0,
  m.id
from payload.buildings b
join payload.buildings_media m on m.id = b.featured_image_id
where m.filename = '4.png'
  and not exists (
    select 1 from payload.buildings_rels r
    where r.parent_id = b.id and r.path = 'images' and r.buildings_media_id = m.id
  );

-- 4) Bratislava: Bratislava Castle (Castles)
insert into payload.buildings (building_type_id, featured_image_id, position, country_id, county_id, city_id, _status)
select
  bt.id,
  bm.id,
  st_setsrid(st_makepoint(17.102, 48.142), 4326),
  c.id,
  co.id,
  ci.id,
  'published'::payload.enum_buildings_status
from payload.building_types bt
join payload.building_types_locales btl on btl._parent_id = bt.id and btl._locale = 'en'::payload._locales and btl.slug = 'castles'
join payload.buildings_media bm on bm.filename = '5.png'
join payload.countries c on c.country_code = 'SK'
join payload.counties co on co.country_id = c.id and co.code = 'SKBL'::payload.enum_counties_code
join payload.cities ci on ci.county_id = co.id
join payload.cities_locales cl on cl._parent_id = ci.id and cl._locale = 'en'::payload._locales and cl.slug = 'bratislava'
where not exists (
  select 1 from payload.buildings_locales bl
  where bl._locale = 'en'::payload._locales and bl.slug = 'bratislava-castle'
);

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'en'::payload._locales,
  b.id,
  'Bratislava Castle',
  'bratislava-castle',
  'A landmark castle complex above the Danube in Bratislava.',
  'Rebuilt and reshaped many times, it has been a key site in the region’s history.',
  'Historic castle architecture with distinctive four-corner towers.',
  'A museum and major viewpoint over the city.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '5.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_locales (_locale, _parent_id, name, slug, summary, history, style, present_day)
select
  'hu'::payload._locales,
  b.id,
  'Pozsonyi vár',
  'pozsonyi-var',
  'Jellegzetes várkomplexum a Duna fölött, Pozsonyban.',
  'Többször átépítették, a térség történelmének egyik fontos helyszíne.',
  'Történelmi várépítészet, jellegzetes négy saroktornyokkal.',
  'Ma múzeum és népszerű kilátóhely a városra.'
from payload.buildings b
where b.featured_image_id = (select id from payload.buildings_media where filename = '5.png' limit 1)
on conflict (_locale, _parent_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  summary = excluded.summary,
  history = excluded.history,
  style = excluded.style,
  present_day = excluded.present_day;

insert into payload.buildings_rels (parent_id, path, "order", buildings_media_id)
select
  b.id,
  'images',
  0,
  m.id
from payload.buildings b
join payload.buildings_media m on m.id = b.featured_image_id
where m.filename = '5.png'
  and not exists (
    select 1 from payload.buildings_rels r
    where r.parent_id = b.id and r.path = 'images' and r.buildings_media_id = m.id
  );

if exists (
  select 1
  from payload.buildings b
  join payload.buildings_locales bl on bl._parent_id = b.id and bl._locale = 'en'::payload._locales
  where bl.slug in (
    'st-michaels-church-cluj',
    'petrovaradin-fortress',
    'lviv-opera-house',
    'bratislava-castle'
  )
  and (
    b.building_type_id is null
    or b.featured_image_id is null
    or b.country_id is null
    or b.county_id is null
    or b.city_id is null
  )
) then
  raise exception 'Seed error: one or more seeded buildings has null required relation fields';
end if;

-- ---------------------------------------------------------------------------
-- Draft/version backfill for Payload admin visibility
-- ---------------------------------------------------------------------------
-- The SQL seeds above write directly to base tables. For collections with
-- `drafts: true`, Payload admin reads from version tables as well, so we
-- mirror the latest published state into `_..._v` / `_..._v_locales`.

insert into payload._countries_v (
  parent_id,
  version_country_code,
  version_image_id,
  version_updated_at,
  version_created_at,
  version__status,
  latest,
  snapshot
)
select
  c.id,
  c.country_code,
  c.image_id,
  c.updated_at,
  c.created_at,
  c._status::text::payload.enum__countries_v_version_status,
  true,
  true
from payload.countries c
where not exists (
  select 1
  from payload._countries_v v
  where v.parent_id = c.id and v.latest is true
);

insert into payload._countries_v_locales (
  version_name,
  version_slug,
  version_meta_title,
  version_meta_description,
  version_meta_image_id,
  _locale,
  _parent_id
)
select
  l.name,
  l.slug,
  l.meta_title,
  l.meta_description,
  l.meta_image_id,
  l._locale,
  v.id
from payload.countries_locales l
join payload._countries_v v on v.parent_id = l._parent_id and v.latest is true
where not exists (
  select 1
  from payload._countries_v_locales vl
  where vl._parent_id = v.id and vl._locale = l._locale
);

insert into payload._building_types_v (
  parent_id,
  version_image_id,
  version_updated_at,
  version_created_at,
  version__status,
  latest,
  snapshot
)
select
  bt.id,
  bt.image_id,
  bt.updated_at,
  bt.created_at,
  bt._status::text::payload.enum__building_types_v_version_status,
  true,
  true
from payload.building_types bt
where not exists (
  select 1
  from payload._building_types_v v
  where v.parent_id = bt.id and v.latest is true
);

insert into payload._building_types_v_locales (
  version_name,
  version_slug,
  version_meta_title,
  version_meta_description,
  version_meta_image_id,
  _locale,
  _parent_id
)
select
  l.name,
  l.slug,
  l.meta_title,
  l.meta_description,
  l.meta_image_id,
  l._locale,
  v.id
from payload.building_types_locales l
join payload._building_types_v v on v.parent_id = l._parent_id and v.latest is true
where not exists (
  select 1
  from payload._building_types_v_locales vl
  where vl._parent_id = v.id and vl._locale = l._locale
);

insert into payload._regions_v (
  parent_id,
  version_country_id,
  version_updated_at,
  version_created_at,
  version__status,
  latest,
  snapshot
)
select
  r.id,
  r.country_id,
  r.updated_at,
  r.created_at,
  r._status::text::payload.enum__regions_v_version_status,
  true,
  true
from payload.regions r
where not exists (
  select 1
  from payload._regions_v v
  where v.parent_id = r.id and v.latest is true
);

insert into payload._regions_v_locales (
  version_name,
  version_slug,
  _locale,
  _parent_id
)
select
  l.name,
  l.slug,
  l._locale,
  v.id
from payload.regions_locales l
join payload._regions_v v on v.parent_id = l._parent_id and v.latest is true
where not exists (
  select 1
  from payload._regions_v_locales vl
  where vl._parent_id = v.id and vl._locale = l._locale
);

insert into payload._counties_v (
  parent_id,
  version_position,
  version_country_id,
  version_region_id,
  version_code,
  version_updated_at,
  version_created_at,
  version__status,
  latest,
  snapshot
)
select
  c.id,
  c.position,
  c.country_id,
  c.region_id,
  c.code::text::payload.enum__counties_v_version_code,
  c.updated_at,
  c.created_at,
  c._status::text::payload.enum__counties_v_version_status,
  true,
  true
from payload.counties c
where not exists (
  select 1
  from payload._counties_v v
  where v.parent_id = c.id and v.latest is true
);

insert into payload._counties_v_locales (
  version_name,
  version_slug,
  version_description,
  _locale,
  _parent_id
)
select
  l.name,
  l.slug,
  l.description,
  l._locale,
  v.id
from payload.counties_locales l
join payload._counties_v v on v.parent_id = l._parent_id and v.latest is true
where not exists (
  select 1
  from payload._counties_v_locales vl
  where vl._parent_id = v.id and vl._locale = l._locale
);

insert into payload._cities_v (
  parent_id,
  version_position,
  version_country_id,
  version_county_id,
  version_updated_at,
  version_created_at,
  version__status,
  latest,
  snapshot
)
select
  c.id,
  c.position,
  c.country_id,
  c.county_id,
  c.updated_at,
  c.created_at,
  c._status::text::payload.enum__cities_v_version_status,
  true,
  true
from payload.cities c
where not exists (
  select 1
  from payload._cities_v v
  where v.parent_id = c.id and v.latest is true
);

insert into payload._cities_v_locales (
  version_name,
  version_slug,
  version_description,
  version_meta_title,
  version_meta_description,
  version_meta_image_id,
  _locale,
  _parent_id
)
select
  l.name,
  l.slug,
  l.description,
  l.meta_title,
  l.meta_description,
  l.meta_image_id,
  l._locale,
  v.id
from payload.cities_locales l
join payload._cities_v v on v.parent_id = l._parent_id and v.latest is true
where not exists (
  select 1
  from payload._cities_v_locales vl
  where vl._parent_id = v.id and vl._locale = l._locale
);

insert into payload._buildings_v (
  parent_id,
  version_building_type_id,
  version_featured_image_id,
  version_position,
  version_country_id,
  version_county_id,
  version_city_id,
  version_creator_name,
  version_creator_email,
  version_suggestions_count,
  version_updated_at,
  version_created_at,
  version__status,
  latest,
  snapshot
)
select
  b.id,
  b.building_type_id,
  b.featured_image_id,
  b.position,
  b.country_id,
  b.county_id,
  b.city_id,
  b.creator_name,
  b.creator_email,
  b.suggestions_count,
  b.updated_at,
  b.created_at,
  b._status::text::payload.enum__buildings_v_version_status,
  true,
  true
from payload.buildings b
where not exists (
  select 1
  from payload._buildings_v v
  where v.parent_id = b.id and v.latest is true
);

insert into payload._buildings_v_locales (
  version_name,
  version_slug,
  version_summary,
  version_history,
  version_style,
  version_present_day,
  version_famous_residents,
  version_renovation,
  version_meta_title,
  version_meta_description,
  version_meta_image_id,
  _locale,
  _parent_id
)
select
  l.name,
  l.slug,
  l.summary,
  l.history,
  l.style,
  l.present_day,
  l.famous_residents,
  l.renovation,
  l.meta_title,
  l.meta_description,
  l.meta_image_id,
  l._locale,
  v.id
from payload.buildings_locales l
join payload._buildings_v v on v.parent_id = l._parent_id and v.latest is true
where not exists (
  select 1
  from payload._buildings_v_locales vl
  where vl._parent_id = v.id and vl._locale = l._locale
);

end $$;
