import { LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypeBySlug } from "@/lib/queries/building-type";
import { getCountries } from "@/lib/queries/country";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuildingTypePage } from "./page.client";

const Page = async (props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
}) => {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { slug, locale } = params;
  if (!slug) return notFound();
  const buildingType = await getBuildingTypeBySlug(locale, slug);
  if (!buildingType) return notFound();

  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const selectedCountry =
    typeof searchParams?.country === "string"
      ? searchParams.country
      : undefined;
  const selectedCounty =
    typeof searchParams?.county === "string" ? searchParams.county : undefined;
  const selectedCity =
    typeof searchParams?.city === "string" ? searchParams.city : undefined;

  const countries = await getCountries(locale);
  const counties = countries
    .filter((country) => country.slug === selectedCountry)
    .map((country) => country.relatedCounties?.docs)
    .filter((county) => county !== undefined && county !== null)
    .flat()
    .filter((county) => typeof county === "object");
  const cities = countries
    .filter((country) => country.slug === selectedCountry)
    .map((country) => country.relatedCities?.docs)
    .filter((city) => city !== undefined && city !== null)
    .flat()
    .filter((city) => typeof city === "object");

  const { buildings, totalPages } = await getBuildingsByFilter(locale, {
    and: [
      {
        buildingType: {
          equals: buildingType.id,
        },
      },
      ...(selectedCity ? [{ "city.slug": { equals: selectedCity } }] : []),
      ...(selectedCounty
        ? [{ "county.slug": { equals: selectedCounty } }]
        : []),
      ...(selectedCountry
        ? [{ "country.slug": { equals: selectedCountry } }]
        : []),
    ],
  });
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <BuildingTypePage
        buildings={buildings}
        buildingType={buildingType}
        country={selectedCountry}
        county={selectedCounty}
        city={selectedCity}
        counties={counties}
        cities={cities}
        countries={countries}
        page={page}
        totalPages={totalPages}
      />
    </Suspense>
  );
};

export default Page;
