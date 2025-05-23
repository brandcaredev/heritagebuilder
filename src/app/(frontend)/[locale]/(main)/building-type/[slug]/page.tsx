import { Locales, LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import {
  getBuildingTypeBySlug,
  getBuildingTypes,
} from "@/lib/queries/building-type";
import { getCountries } from "@/lib/queries/country";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuildingTypeClientPage } from "./page.client";
import { LoaderCircle } from "lucide-react";
import { Metadata } from "next";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
};

export const generateStaticParams = async () => {
  const params = [];

  for (const locale of Object.values(Locales)) {
    const buildingTypes = await getBuildingTypes(locale as LocaleType);
    const buildingTypeParams = buildingTypes.map((buildingType) => ({
      locale,
      slug: buildingType.slug,
    }));
    params.push(...buildingTypeParams);
  }

  return params;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale, slug } = await params;
  const buildingType = await getBuildingTypeBySlug(locale, slug);
  if (!buildingType) return {};
  return {
    title: buildingType.name,
  };
};

const BuildingTypePage = async (props: Props) => {
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

  const { buildings, totalPages } = await getBuildingsByFilter(
    locale,
    {
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
    },
    12,
    page,
  );

  return (
    <Suspense
      fallback={
        <div className="container relative flex h-screen w-full items-center justify-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-brown" />
        </div>
      }
    >
      <BuildingTypeClientPage
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

export default BuildingTypePage;
