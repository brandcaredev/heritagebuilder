import { extractPlainTextFromRichtext } from "@/lib/seo-utils";
import type { PayloadRequest } from "payload";

type LocationContext = {
  countryName?: string;
  countyName?: string;
  cityName?: string;
};

type SupportedCollection = "buildings" | "cities" | "counties";

export type AIDocContext = {
  name?: string;
  buildingTypeName?: string;
  regionName?: string;
  location?: LocationContext;
  sources?: string[];
};

export type AIDocContextResult = {
  doc: AIDocContext;
  existingValue: string;
};

const getName = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : undefined;
  }
  return undefined;
};

const buildSources = (source: unknown): string[] => {
  if (!Array.isArray(source)) return [];

  return source
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const sourceType = typeof r.sourceType === "string" ? r.sourceType : "";

      if (sourceType === "book") {
        const author = typeof r.bookAuthor === "string" ? r.bookAuthor : "";
        const title = typeof r.bookTitle === "string" ? r.bookTitle : "";
        const year = typeof r.bookYear === "number" ? ` (${r.bookYear})` : "";
        const publisher =
          typeof r.bookPublisher === "string" ? `, ${r.bookPublisher}` : "";
        const main = [author, title].filter(Boolean).join(" — ");
        return main ? `Book: ${main}${year}${publisher}` : "Book";
      }

      if (sourceType === "website") {
        const url = typeof r.websiteUrl === "string" ? r.websiteUrl : "";
        return url ? `Website: ${url}` : "Website";
      }

      if (sourceType === "other") {
        const other = typeof r.otherSource === "string" ? r.otherSource : "";
        return other ? `Other: ${other}` : "Other";
      }

      return null;
    })
    .filter((v): v is string => Boolean(v));
};

const SUPPORTED_COLLECTIONS = new Set<SupportedCollection>([
  "buildings",
  "cities",
  "counties",
]);

const isSupportedCollection = (value: string): value is SupportedCollection =>
  SUPPORTED_COLLECTIONS.has(value as SupportedCollection);

const safeFieldAsText = (doc: Record<string, unknown>, fieldPath: string): string => {
  const value = doc[fieldPath];
  if (typeof value === "string") return value;
  return extractPlainTextFromRichtext(value);
};

const buildContextDoc = (
  collection: SupportedCollection,
  doc: Record<string, unknown>,
): AIDocContext => {
  if (collection === "buildings") {
    return {
      name: typeof doc.name === "string" ? doc.name : undefined,
      buildingTypeName: getName(doc.buildingType),
      location: {
        countryName: getName(doc.country),
        countyName: getName(doc.county),
        cityName: getName(doc.city),
      },
      sources: buildSources(doc.source),
    };
  }

  if (collection === "cities") {
    return {
      name: typeof doc.name === "string" ? doc.name : undefined,
      location: {
        countryName: getName(doc.country),
        countyName: getName(doc.county),
      },
    };
  }

  if (collection === "counties") {
    return {
      name: typeof doc.name === "string" ? doc.name : undefined,
      regionName: getName(doc.region),
      location: {
        countryName: getName(doc.country),
      },
    };
  }

  return {};
};

export const buildSafeDocContext = async (args: {
  req: PayloadRequest;
  collection: string;
  docId: string;
  locale: string;
  fieldPath: string;
}): Promise<AIDocContextResult> => {
  const { req, collection, docId, locale, fieldPath } = args;

  if (!isSupportedCollection(collection)) {
    throw new Error(`Unsupported collection: ${collection}`);
  }

  const doc = (await req.payload.findByID({
    collection,
    id: docId,
    depth: 2,
    locale: locale as unknown as "en" | "hu",
  })) as unknown as Record<string, unknown>;
  const contextDoc = buildContextDoc(collection, doc);

  return {
    doc: contextDoc,
    existingValue: safeFieldAsText(doc, fieldPath),
  };
};
