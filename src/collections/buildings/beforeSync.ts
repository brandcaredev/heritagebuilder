import { BeforeSync } from "@payloadcms/plugin-search/types";

export const beforeSyncWithSearch: BeforeSync = async ({
  originalDoc,
  searchDoc,
}) => {
  const { slug, name, buildingType, featuredImage, city, country } =
    originalDoc;
  return {
    ...searchDoc,
    slug,
    name,
    buildingType,
    featuredImage,
    city: city?.name,
    country: country?.name,
  };
};
