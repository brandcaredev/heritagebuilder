import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import CountryPage from "./country";
import { type CountryExtended } from "@/server/db/zodSchemaTypes";

export default async function CountryMainPage(
  props: {
    params: Promise<{ slug: string; locale: string }>;
  }
) {
  const params = await props.params;

  const {
    slug,
    locale
  } = params;

  if (!slug) return notFound();
  const country = await api.country.getCountryBySlug({ slug, lang: locale });
  const buildingTypes = await api.buildingType.getBuildingTypes({
    lang: locale,
  });
  if (!country) return notFound();

  return (
    <CountryPage
      country={country as CountryExtended}
      buildingTypes={buildingTypes}
    />
  );
}
