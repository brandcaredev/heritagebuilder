import config from "@payload-config";
import { sql } from "@payloadcms/db-postgres";
import { getPayload, type CollectionSlug } from "payload";
import sharp from "sharp";

type UploadDoc = {
  id: number | string;
  alt?: string | null;
  filename?: string | null;
  filesize?: number | null;
  mimeType?: string | null;
  url?: string | null;
};

type UploadCollection = Extract<
  CollectionSlug,
  "buildings-media" | "building-types-media" | "countries-media" | "media"
>;

type RelinkResult = {
  references: number;
  relinked: number;
};

const uploadCollections: UploadCollection[] = [
  "buildings-media",
  "building-types-media",
  "countries-media",
  "media",
];

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const apply = args.get("apply") === "true";
const force = args.get("force") === "true";
const includeUnlinked = args.get("include-unlinked") === "true";
const revalidate = args.get("revalidate") !== "false";
const minKb = Number(args.get("min-kb") ?? 512);
const limit = Number(args.get("limit") ?? 0);
const maxWidth = Number(args.get("width") ?? 2000);
const quality = Number(args.get("quality") ?? 82);
const collections = (args.get("collections")?.split(",") ??
  uploadCollections) as UploadCollection[];
const confirm = args.get("confirm");

const requiredApplyConfirmation = "CREATE_AND_RELINK_WEBP";
const touchedCacheTags = new Set<string>();

const formatBytes = (bytes: number) =>
  `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const makeWebpFilename = (filename: string) =>
  `${filename.replace(/\.[^.]+$/, "") || filename}.webp`;

const getSiteURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  url = url.startsWith("http") ? url : `https://${url}`;
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

const getAbsoluteUrl = (url: string) =>
  url.startsWith("http") ? url : `${getSiteURL()}${url}`;

const shouldProcess = (doc: UploadDoc) => {
  if (!doc.url || !doc.filename || !doc.filesize || !doc.mimeType) {
    return false;
  }

  if (!doc.mimeType.startsWith("image/") || doc.mimeType === "image/svg+xml") {
    return false;
  }

  if (!force && doc.mimeType === "image/webp") {
    return false;
  }

  return doc.filesize >= minKb * 1024;
};

const getCacheTagsForCollection = (collection: UploadCollection) => {
  if (collection === "buildings-media") return ["buildings"];
  if (collection === "building-types-media") return ["building-types"];
  if (collection === "countries-media") return ["countries"];

  return [
    "about-us",
    "building-types",
    "buildings",
    "cities",
    "community",
    "countries",
  ];
};

const revalidateCacheTags = async (tags: string[]) => {
  if (tags.length === 0) return;

  if (!process.env.PAYLOAD_SECRET) {
    console.warn("Skipping cache revalidation: PAYLOAD_SECRET is not set.");
    return;
  }

  const response = await fetch(`${getSiteURL()}/api/revalidate`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.PAYLOAD_SECRET}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ tags }),
  });

  if (!response.ok) {
    console.warn(
      `Cache revalidation failed (${response.status}): ${await response.text()}`,
    );
    return;
  }

  console.log(`Revalidated cache tags: ${tags.join(", ")}`);
};

const payload = await getPayload({ config });
const db = payload.db.drizzle;

const rowsFrom = <T>(result: unknown): T[] => {
  if (Array.isArray(result)) return result as T[];
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: T[] }).rows;
  }

  return [];
};

const numberFrom = (value: unknown) => Number(value ?? 0);

const queryReferenceCount = async (
  collection: UploadCollection,
  id: UploadDoc["id"],
) => {
  if (collection === "buildings-media") {
    const result = await db.execute(sql`
      SELECT
        (
          SELECT count(*) FROM "payload"."buildings"
          WHERE "featured_image_id" = ${id}
        ) +
        (
          SELECT count(*) FROM "payload"."buildings_rels"
          WHERE "path" = 'images' AND "buildings_media_id" = ${id}
        ) +
        (
          SELECT count(*) FROM "payload"."_buildings_v"
          WHERE "version_featured_image_id" = ${id}
        ) +
        (
          SELECT count(*) FROM "payload"."_buildings_v_rels"
          WHERE "path" = 'version.images' AND "buildings_media_id" = ${id}
        ) +
        (
          SELECT count(*) FROM "payload"."search"
          WHERE "featured_image_id" = ${id}
        ) AS count
    `);

    return numberFrom(rowsFrom<{ count: unknown }>(result)[0]?.count);
  }

  if (collection === "building-types-media") {
    const result = await db.execute(sql`
      SELECT
        (
          SELECT count(*) FROM "payload"."building_types"
          WHERE "image_id" = ${id}
        ) +
        (
          SELECT count(*) FROM "payload"."_building_types_v"
          WHERE "version_image_id" = ${id}
        ) AS count
    `);

    return numberFrom(rowsFrom<{ count: unknown }>(result)[0]?.count);
  }

  if (collection === "countries-media") {
    const result = await db.execute(sql`
      SELECT
        (
          SELECT count(*) FROM "payload"."countries"
          WHERE "image_id" = ${id}
        ) +
        (
          SELECT count(*) FROM "payload"."_countries_v"
          WHERE "version_image_id" = ${id}
        ) AS count
    `);

    return numberFrom(rowsFrom<{ count: unknown }>(result)[0]?.count);
  }

  const result = await db.execute(sql`
    SELECT
      (
        SELECT count(*) FROM "payload"."about_us"
        WHERE "featured_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."community"
        WHERE "featured_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."about_us_locales"
        WHERE "meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."buildings_locales"
        WHERE "meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."building_types_locales"
        WHERE "meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."countries_locales"
        WHERE "meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."cities_locales"
        WHERE "meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."_buildings_v_locales"
        WHERE "version_meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."_building_types_v_locales"
        WHERE "version_meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."_countries_v_locales"
        WHERE "version_meta_image_id" = ${id}
      ) +
      (
        SELECT count(*) FROM "payload"."_cities_v_locales"
        WHERE "version_meta_image_id" = ${id}
      ) AS count
  `);

  return numberFrom(rowsFrom<{ count: unknown }>(result)[0]?.count);
};

const relinkReferences = async (
  collection: UploadCollection,
  oldId: UploadDoc["id"],
  newId: UploadDoc["id"],
): Promise<RelinkResult> => {
  const references = await queryReferenceCount(collection, oldId);

  if (collection === "buildings-media") {
    await db.execute(sql`
      UPDATE "payload"."buildings"
      SET "featured_image_id" = ${newId}
      WHERE "featured_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."buildings_rels"
      SET "buildings_media_id" = ${newId}
      WHERE "path" = 'images' AND "buildings_media_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_buildings_v"
      SET "version_featured_image_id" = ${newId}
      WHERE "version_featured_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_buildings_v_rels"
      SET "buildings_media_id" = ${newId}
      WHERE "path" = 'version.images' AND "buildings_media_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."search"
      SET "featured_image_id" = ${newId}
      WHERE "featured_image_id" = ${oldId}
    `);
  } else if (collection === "building-types-media") {
    await db.execute(sql`
      UPDATE "payload"."building_types"
      SET "image_id" = ${newId}
      WHERE "image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_building_types_v"
      SET "version_image_id" = ${newId}
      WHERE "version_image_id" = ${oldId}
    `);
  } else if (collection === "countries-media") {
    await db.execute(sql`
      UPDATE "payload"."countries"
      SET "image_id" = ${newId}
      WHERE "image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_countries_v"
      SET "version_image_id" = ${newId}
      WHERE "version_image_id" = ${oldId}
    `);
  } else {
    await db.execute(sql`
      UPDATE "payload"."about_us"
      SET "featured_image_id" = ${newId}
      WHERE "featured_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."community"
      SET "featured_image_id" = ${newId}
      WHERE "featured_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."about_us_locales"
      SET "meta_image_id" = ${newId}
      WHERE "meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."buildings_locales"
      SET "meta_image_id" = ${newId}
      WHERE "meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."building_types_locales"
      SET "meta_image_id" = ${newId}
      WHERE "meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."countries_locales"
      SET "meta_image_id" = ${newId}
      WHERE "meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."cities_locales"
      SET "meta_image_id" = ${newId}
      WHERE "meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_buildings_v_locales"
      SET "version_meta_image_id" = ${newId}
      WHERE "version_meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_building_types_v_locales"
      SET "version_meta_image_id" = ${newId}
      WHERE "version_meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_countries_v_locales"
      SET "version_meta_image_id" = ${newId}
      WHERE "version_meta_image_id" = ${oldId}
    `);
    await db.execute(sql`
      UPDATE "payload"."_cities_v_locales"
      SET "version_meta_image_id" = ${newId}
      WHERE "version_meta_image_id" = ${oldId}
    `);
  }

  return {
    references,
    relinked: references - (await queryReferenceCount(collection, oldId)),
  };
};

if (apply && confirm !== requiredApplyConfirmation) {
  console.error(
    `Refusing to apply without confirm=${requiredApplyConfirmation}. ` +
      "Apply creates new WebP media docs and relinks references, but leaves old media docs/files for later cleanup.",
  );
  process.exit(1);
}

let processed = 0;
let skipped = 0;
let beforeTotal = 0;
let afterTotal = 0;

console.log(
  `${apply ? "Applying" : "Dry run:"} creating optimized media for ` +
    `${collections.join(", ")} (min ${minKb} KB, width ${maxWidth}, ` +
    `quality ${quality}, ${includeUnlinked ? "including" : "skipping"} unlinked docs)`,
);

for (const collection of collections) {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 0,
    overrideAccess: true,
  });

  for (const doc of result.docs as UploadDoc[]) {
    if (limit > 0 && processed >= limit) break;

    if (!shouldProcess(doc)) {
      skipped += 1;
      continue;
    }

    const referenceCount = await queryReferenceCount(collection, doc.id);
    if (!includeUnlinked && referenceCount === 0) {
      skipped += 1;
      continue;
    }

    const sourceUrl = getAbsoluteUrl(doc.url!);
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      console.warn(
        `Skipping ${collection}/${doc.id}: failed to download ${sourceUrl}`,
      );
      skipped += 1;
      continue;
    }

    const input = Buffer.from(await response.arrayBuffer());
    const output = await sharp(input, { animated: false })
      .rotate()
      .resize({
        fit: "inside",
        height: maxWidth,
        width: maxWidth,
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    if (!force && output.length >= input.length) {
      console.log(
        `skip ${collection}/${doc.id} ${doc.filename}: optimized file is larger`,
      );
      skipped += 1;
      continue;
    }

    beforeTotal += input.length;
    afterTotal += output.length;
    processed += 1;

    const nextFilename = makeWebpFilename(doc.filename!);
    const saving = input.length - output.length;

    console.log(
      `${apply ? "create+relink" : "would create+relink"} ` +
        `${collection}/${doc.id} (${referenceCount} refs) ` +
        `${doc.filename} -> ${nextFilename}: ` +
        `${formatBytes(input.length)} -> ${formatBytes(output.length)} ` +
        `saved ${formatBytes(saving)}`,
    );

    if (apply) {
      const optimizedDoc = await payload.create({
        collection,
        data: {
          ...(typeof doc.alt === "string" ? { alt: doc.alt } : {}),
        },
        file: {
          data: output,
          mimetype: "image/webp",
          name: nextFilename,
          size: output.length,
        },
        overrideAccess: true,
      });

      const relinkResult = await relinkReferences(
        collection,
        doc.id,
        optimizedDoc.id,
      );

      console.log(
        `created ${collection}/${optimizedDoc.id}; relinked ` +
          `${relinkResult.relinked}/${relinkResult.references} refs from ${collection}/${doc.id}`,
      );

      if (relinkResult.relinked > 0) {
        for (const tag of getCacheTagsForCollection(collection)) {
          touchedCacheTags.add(tag);
        }
      }
    }
  }
}

if (apply && revalidate) {
  await revalidateCacheTags([...touchedCacheTags]);
}

console.log("");
console.log(`Processed: ${processed}`);
console.log(`Skipped: ${skipped}`);
console.log(
  `Estimated savings after relinking: ${formatBytes(beforeTotal - afterTotal)} ` +
    `(${formatBytes(beforeTotal)} -> ${formatBytes(afterTotal)})`,
);
console.log(
  apply
    ? "Finished creating optimized uploads and relinking references. Old media docs/files were intentionally left in place."
    : "Dry run only. Re-run with apply=true confirm=CREATE_AND_RELINK_WEBP to create optimized uploads and relink references.",
);

process.exit(0);
