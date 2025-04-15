import Breadcrumbs from "@/_components/breadcrumbs";
import { Divider } from "@/components/icons";
import { Locales, LocaleType } from "@/lib/constans";
import { getSEOFromDoc } from "@/lib/getSEOFromDoc";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCitiesByFilter, getCityBySlug } from "@/lib/queries/city";
import { notFound } from "next/navigation";
import { Country, County } from "payload-types";
import BuildingList from "@/_components/building-list";
import SimplePage from "@/_components/simple-page";
import { Metadata } from "next";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
};

export const generateStaticParams = async () => {
  const params = [];

  for (const locale of Object.values(Locales)) {
    const { cities } = await getCitiesByFilter(locale as LocaleType, {});
    const cityParams = cities.map((city) => ({
      locale,
      slug: city.slug,
    }));
    params.push(...cityParams);
  }

  return params;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale, slug } = await params;
  const city = await getCityBySlug(locale, slug);
  if (!city) return {};
  return getSEOFromDoc(city);
};

const CityPage = async (props: Props) => {
  const params = await props.params;
  const { slug, locale } = params;
  const searchParams = await props.searchParams;
  if (!slug) return notFound();

  const city = await getCityBySlug(locale, slug);
  const buildingTypes = await getBuildingTypes(locale);
  if (!city) return notFound();

  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const { buildings, totalPages } = await getBuildingsByFilter(
    locale,
    {
      city: {
        equals: city.id,
      },
      ...(searchParams?.buildingType && {
        "buildingType.slug": {
          equals: searchParams.buildingType as string,
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
  const cityCountry = city.country as Country;
  const cityCounty = city.county as County;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex w-fit flex-col">
        <Breadcrumbs
          items={[
            {
              name: cityCountry.name,
              href: {
                pathname: "/country/[slug]",
                params: { slug: cityCountry.slug },
              },
            },
            {
              name: cityCounty.name,
              href: {
                pathname: "/county/[slug]",
                params: { slug: cityCounty.slug },
              },
            },
            { name: city.name },
          ]}
        />
        <Divider orientation="horizontal" />
      </div>
      <div className="flex flex-col">
        <SimplePage
          name={city.name}
          description={city.description}
          buildings={buildings}
          position={city.position}
        />
        <BuildingList
          buildings={buildings}
          buildingTypes={buildingTypes}
          buildingTypeFilter={searchParams?.buildingType as string}
          totalPages={totalPages}
          page={page}
        />
      </div>
    </div>
  );
};

export default CityPage;
