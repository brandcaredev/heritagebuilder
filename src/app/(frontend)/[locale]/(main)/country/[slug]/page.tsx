import { LocaleType } from "@/lib/constans";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountryBySlug } from "@/lib/queries/country";
import { notFound } from "next/navigation";
import CountryPage from "./page.client";
import { getBuildingsByFilter } from "@/lib/queries/building";
import BuildingList from "@/_components/building-list";

const CountryMainPage = async (props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
}) => {
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
