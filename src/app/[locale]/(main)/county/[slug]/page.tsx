import Breadcrumbs from "@/app/[locale]/_components/breadcrumbs";
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

  const {
    locale,
    slug
  } = params;

  const county = await api.county.getCountyBySlug({ slug, lang: locale });
  const buildingTypes = await api.buildingType.getBuildingTypes({
    lang: locale,
  });
  if (!county) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex w-fit flex-col">
        <Breadcrumbs
          items={[
            {
              name: county.country!.name,
              href: {
                pathname: "/country/[slug]",
                params: { slug: county.country!.slug },
              },
            },
            { name: county.name! },
          ]}
        />
        <Divider orientation="horizontal" />
      </div>
      <SimplePage
        name={county.name!}
        description={county.description}
        buildings={county.buildings as IBuilding[]}
        position={county.position}
        buildingTypes={buildingTypes}
      />
    </div>
  );
}
