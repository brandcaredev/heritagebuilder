import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {},
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytes")
      : (sizes[i] ?? "Bytes")
  }`;
}

export function slugify(value: string): string {
  if (!value) return "";
  /**
   * Converts a string to a URL-friendly slug.
   *
   * @param value - The string to be converted.
   * @returns A URL-friendly slug.
   */
  // Normalize the string to decompose combined letters into base letters and diacritics
  value = value.normalize("NFKD");
  // Remove diacritical marks (accents) using a regular expression
  value = value.replace(/[\u0300-\u036f]/g, "");
  // Convert to lowercase
  value = value.toLowerCase();
  // Remove invalid characters (anything that's not a letter, number, space, or hyphen)
  value = value.replace(/[^a-z0-9\s-]/g, "");
  // Replace multiple spaces or hyphens with a single hyphen
  value = value.replace(/[\s-]+/g, "-");
  // Trim leading and trailing hyphens
  value = value.replace(/^-+|-+$/g, "");
  return value;
}

export const mergeLanguageData = <
  T extends { data: Array<{ language: string }> },
  D extends T["data"][number] = T["data"][number],
>(
  item: T,
  requestedLang: string,
  defaultLang = "hu",
) => {
  const selectedLang = item.data.find(
    (data) => data.language === requestedLang,
  ) as D | undefined;
  const defaultLangData = item.data.find(
    (data) => data.language === defaultLang,
  ) as D | undefined;

  if (!defaultLangData) {
    console.error(`Data not found for item ${JSON.stringify(item)}`);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, ...rest } = item;
  return {
    ...rest,
    ...defaultLangData,
    ...selectedLang,
  } as Omit<T, "data"> & D;
};

export const getURL = () => {
  // TODO URLS
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.startsWith("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};
