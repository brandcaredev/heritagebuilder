import Breadcrumbs from "@/_components/breadcrumbs";
import Divider from "@/components/icons/divider";
import { LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountyBySlug } from "@/lib/queries/county";
import { notFound } from "next/navigation";
import { Country } from "payload-types";
import BuildingList from "@/_components/building-list";
import SimplePage from "@/_components/simple-page";

const CountyPage = async (props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
}) => {
  const params = await props.params;
  const { slug, locale } = params;
  const searchParams = await props.searchParams;
  if (!slug) return notFound();

  const county = await getCountyBySlug(locale, slug);
  const buildingTypes = await getBuildingTypes(locale);
  if (!county) return notFound();

  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const { buildings, totalPages } = await getBuildingsByFilter(
    locale,
    {
      county: {
        equals: county.id,
      },
      ...(searchParams?.buildingType && {
        "buildingType.slug": {
          equals: searchParams.buildingType as string,
        },
      }),
    },
    12,
    page,
  );

  const countyCountry = county.country as Country;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex w-fit flex-col">
        <Breadcrumbs
          items={[
            {
              name: countyCountry.name,
              href: {
                pathname: "/country/[slug]",
                params: { slug: countyCountry.slug },
              },
            },
            { name: county.name },
          ]}
        />
        <Divider orientation="horizontal" />
      </div>
      <div className="flex flex-col">
        <SimplePage
          name={county.name}
          description={county.description}
          buildings={buildings}
          position={county.position}
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

export default CountyPage;
