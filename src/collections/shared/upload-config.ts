import type { CollectionConfig } from "payload";

type UploadConfig = Exclude<CollectionConfig["upload"], boolean | undefined>;

export const cacheableImageUploadConfig = {
  formatOptions: {
    format: "webp",
    options: {
      quality: 84,
    },
  },
  modifyResponseHeaders: ({ headers }) => {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return headers;
  },
  resizeOptions: {
    width: 2000,
    height: 2000,
    fit: "inside",
    withoutEnlargement: true,
  },
} satisfies Pick<
  UploadConfig,
  "formatOptions" | "modifyResponseHeaders" | "resizeOptions"
>;
