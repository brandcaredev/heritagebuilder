import Breadcrumbs from "@/app/(frontend)/locale/_components/breadcrumbs";
import Divider from "@/components/icons/divider";
import { IBuilding } from "@/server/db/zodSchemaTypes";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import SimplePage from "../../../_components/simple-page";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CountyPage(props: Props) {
  const params = await props.params;

  const { locale, slug } = params;

  const city = await api.city.getCityBySlug({ slug, lang: locale });
  const buildingTypes = await api.buildingType.getBuildingTypes({
    lang: locale,
  });
  if (!city) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex w-fit flex-col">
        <Breadcrumbs
          items={[
            {
              name: city.country!.name,
              href: {
                pathname: "/country/[slug]",
                params: { slug: city.country!.slug },
              },
            },
            {
              name: city.county!.name,
              href: {
                pathname: "/county/[slug]",
                params: { slug: city.county!.slug },
              },
            },
            { name: city.name! },
          ]}
        />
        <Divider orientation="horizontal" />
      </div>
      <SimplePage
        name={city.name!}
        description={city.description}
        buildings={city.buildings as IBuilding[]}
        position={city.position}
        buildingTypes={buildingTypes}
      />
    </div>
  );
}
