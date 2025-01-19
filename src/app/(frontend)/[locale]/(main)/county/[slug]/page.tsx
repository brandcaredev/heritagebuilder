import Breadcrumbs from "@/_components/breadcrumbs";
import Divider from "@/components/icons/divider";
import { LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountyBySlug } from "@/lib/queries/county";
import { notFound } from "next/navigation";
import { Country } from "payload-types";
import SimplePage from "../../../_components/simple-page";

interface Props {
  params: Promise<{
    locale: LocaleType;
    slug: string;
  }>;
}

export default async function CountyPage(props: Props) {
  const params = await props.params;

  const { locale, slug } = params;

  const county = await getCountyBySlug(locale, slug);
  const buildingTypes = await getBuildingTypes(locale);
  if (!county) {
    notFound();
  }
  const { buildings: countyBuildings } = await getBuildingsByFilter(locale, {
    city: {
      equals: county.id,
    },
  });
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
      <SimplePage
        name={county.name}
        description={county.description}
        buildings={countyBuildings}
        position={county.position}
        buildingTypes={buildingTypes}
      />
    </div>
  );
}
