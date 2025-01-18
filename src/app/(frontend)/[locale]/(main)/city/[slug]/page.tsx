import Breadcrumbs from "@/_components/breadcrumbs";
import Divider from "@/components/icons/divider";
import { LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCityBySlug } from "@/lib/queries/city";
import { notFound } from "next/navigation";
import { Country, County } from "payload-types";
import SimplePage from "../../../_components/simple-page";

interface Props {
  params: Promise<{
    locale: LocaleType;
    slug: string;
  }>;
}

export default async function CityPage(props: Props) {
  const params = await props.params;

  const { locale, slug } = params;

  const city = await getCityBySlug(locale, slug);

  const buildingTypes = await getBuildingTypes(locale);
  if (!city) {
    notFound();
  }

  const cityBuildings = await getBuildingsByFilter(locale, {
    city: {
      equals: city.id,
    },
  });
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
      <SimplePage
        name={city.name}
        description={city.description}
        buildings={cityBuildings}
        position={city.position}
        buildingTypes={buildingTypes}
      />
    </div>
  );
}
