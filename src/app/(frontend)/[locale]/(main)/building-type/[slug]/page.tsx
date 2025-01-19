import { LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypeBySlug } from "@/lib/queries/building-type";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FilterForm from "./filter-form";
import BuildingCard from "./building-card";
import Pagination from "./pagination";
import { getCountries } from "@/lib/queries/country";
import { getCountiesByFilter } from "@/lib/queries/county";
import { getCitiesByFilter } from "@/lib/queries/city";

export default async function BuildingTypePage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { slug, locale } = params;
  if (!slug) return notFound();
  const buildingType = await getBuildingTypeBySlug(locale, slug);
  if (!buildingType) return notFound();

  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const country =
    typeof searchParams?.country === "string"
      ? searchParams.country
      : undefined;
  const county =
    typeof searchParams?.county === "string" ? searchParams.county : undefined;
  const city =
    typeof searchParams?.city === "string" ? searchParams.city : undefined;

  const countries = await getCountries(locale);
  const { counties } = await getCountiesByFilter(locale, {
    ...(country && { "country.slug": { equals: country } }),
  });
  const { cities } = await getCitiesByFilter(locale, {
    ...(country && { "country.slug": { equals: country } }),
    ...(county && { "county.slug": { equals: county } }),
  });
  const { buildings, totalPages } = await getBuildingsByFilter(locale, {
    and: [
      {
        buildingType: {
          equals: buildingType.id,
        },
      },
      ...(city ? [{ "city.slug": { equals: city } }] : []),
      ...(county ? [{ "county.slug": { equals: county } }] : []),
      ...(country ? [{ "country.slug": { equals: country } }] : []),
    ],
  });
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Buildings</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <FilterForm
          buildingType={buildingType.slug}
          country={country}
          county={county}
          city={city}
          counties={counties}
          cities={cities}
          countries={countries}
        />
      </Suspense>
      <div className="my-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {buildings.map((building) => (
          <BuildingCard key={building.id} building={building} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
