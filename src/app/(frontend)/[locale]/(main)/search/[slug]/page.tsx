import { LocaleType } from "@/lib/constans";
import { searchBuildings } from "@/lib/queries/building";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/_components/breadcrumbs";
import Divider from "@/components/icons/divider";
import { getBuildingTypes } from "@/lib/queries/building-type";
import BuildingList from "@/_components/building-list";
import { Building } from "payload-types";

//TODO
const SearchPage = async (props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
}) => {
  const params = await props.params;
  const { slug, locale } = params;
  const searchParams = await props.searchParams;
  if (!slug) return notFound();

  const buildingTypes = await getBuildingTypes(locale);
  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const { buildings, totalPages } = await searchBuildings(
    slug,
    locale,
    12,
    page,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex w-fit flex-col">
        <Breadcrumbs items={[{ name: "Search Results" }]} />
        <Divider orientation="horizontal" />
      </div>
      <div className="flex flex-col">
        <BuildingList
          title={`‘${slug}’`}
          buildings={buildings as unknown as Building[]}
          buildingTypes={buildingTypes}
          buildingTypeFilter={searchParams?.buildingType as string}
          totalPages={totalPages}
          page={page}
        />
      </div>
    </div>
  );
};

export default SearchPage;
