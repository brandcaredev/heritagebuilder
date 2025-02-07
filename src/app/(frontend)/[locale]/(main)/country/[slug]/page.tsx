import BuildingList from "@/_components/building-list";
import { Locales, LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountries, getCountryBySlug } from "@/lib/queries/country";
import { getCountyBySlug } from "@/lib/queries/county";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import CountryPage from "./page.client";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
};

export const generateStaticParams = async () => {
  const params = [];

  for (const locale of Object.values(Locales)) {
    const countries = await getCountries(locale as LocaleType);
    const countryParams = countries.map((country) => ({
      locale,
      slug: country.slug,
    }));
    params.push(...countryParams);
  }

  return params;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale, slug } = await params;
  const country = await getCountryBySlug(locale, slug);
  if (!country) return {};
  return {
    title: country.name,
  };
};

const CountryMainPage = async (props: Props) => {
  const params = await props.params;
  const { slug, locale } = params;
  const searchParams = await props.searchParams;

  if (!slug) return notFound();
  const country = await getCountryBySlug(locale, slug);
  const buildingTypes = await getBuildingTypes(locale);
  if (!country) return notFound();

  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const { buildings, totalPages } = await getBuildingsByFilter(
    locale,
    {
      country: {
        equals: country.id,
      },
      ...(searchParams?.buildingType && {
        "buildingType.slug": {
          equals: searchParams.buildingType,
        },
      }),
      ...(searchParams?.q && {
        or: [
          {
            name: {
              like: searchParams.q,
            },
          },
          {
            summary: {
              like: searchParams.q,
            },
          },
        ],
      }),
    },
    12,
    page,
  );
  return (
    <div>
      <CountryPage country={country} buildingTypes={buildingTypes} />
      <BuildingList
        buildingTypes={buildingTypes}
        buildings={buildings}
        buildingTypeFilter={searchParams?.buildingType as string}
        totalPages={totalPages}
        page={page}
      />
    </div>
  );
};

export default CountryMainPage;
