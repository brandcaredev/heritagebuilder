import {
  Building,
  City,
  Config,
  Country,
  County,
  Media,
  Region,
} from "payload-types";
import { Metadata } from "next";
import { getURL } from "@/lib/utils";

const getImageURL = (image?: Media | Config["db"]["defaultIDType"] | null) => {
  const serverUrl = getURL();

  let url = serverUrl + "/website-template-OG.webp";

  if (image && typeof image === "object" && "url" in image) {
    const ogUrl = image.sizes?.og?.url;

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url;
  }

  return url;
};

export const getSEOFromDoc = (
  doc: Building | City | Country | County | Region,
): Metadata => {
  if (!doc) return {};

  const { meta } = doc;

  // Default values from document properties
  const title = meta?.title || doc.name || "";
  const ogImage = meta?.image
    ? getImageURL(meta?.image)
    : doc.hasOwnProperty("featuredImage") &&
        typeof (doc as any).featuredImage === "object"
      ? getImageURL((doc as any).featuredImage)
      : undefined;

  const description =
    doc.hasOwnProperty("description") &&
    typeof (doc as any).description === "string"
      ? (doc as any).description
      : doc.hasOwnProperty("summary") &&
          typeof (doc as any).summary === "string"
        ? (doc as any).summary
        : "";

  // If no SEO fields, return basic metadata
  if (!meta) {
    return {
      title,
      description: description,
      openGraph: ogImage
        ? {
            images: [ogImage],
            title,
          }
        : undefined,
    };
  }

  return {
    title: meta.title || title,
    description: meta.description || description || "",
    // OpenGraph data
    openGraph: {
      title: meta.title || title,
      description: meta.description || description || "",
      images: ogImage ? [ogImage] : undefined,
    },
  };
};
