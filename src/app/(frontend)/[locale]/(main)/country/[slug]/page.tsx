import { LocaleType } from "@/lib/constans";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountryBySlug } from "@/lib/queries/country";
import { notFound } from "next/navigation";
import CountryPage from "./country";
import { getBuildingsByFilter } from "@/lib/queries/building";

export default async function CountryMainPage(props: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}) {
  const params = await props.params;

  const { slug, locale } = params;

  if (!slug) return notFound();
  const country = await getCountryBySlug(locale, slug);
  const buildingTypes = await getBuildingTypes(locale);
  if (!country) return notFound();
  const countryBuildings = await getBuildingsByFilter(locale, {
    country: {
      equals: country.id,
    },
  });
  return (
    <CountryPage
      country={country}
      buildingTypes={buildingTypes}
      countryBuildings={countryBuildings}
    />
  );
}
