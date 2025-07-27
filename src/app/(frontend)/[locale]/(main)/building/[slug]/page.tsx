import BuildingComponent from "@/_components/building";
import { BuildingStructuredData } from "@/components/structured-data";
import { Locales, LocaleType } from "@/lib/constans";
import { getBuildingBySlug, getBuildings } from "@/lib/queries/building";
import { createMetadata, generateMetaDescription } from "@/lib/seo-utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Media } from "payload-types";

type Props = {
  params: Promise<{ slug: string; locale: LocaleType }>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale, slug } = await params;
  const building = await getBuildingBySlug(locale, slug);
  if (!building) return {};

  const path = locale === 'hu' ? `/epulet/${building.slug}` : `/building/${building.slug}`;
  const description = generateMetaDescription(building.summary);
  
  return createMetadata({
    title: building.name,
    description,
    path,
    locale,
    image: building.featuredImage,
    type: 'article',
  });
};

export const generateStaticParams = async () => {
  const params = [];

  for (const locale of Object.values(Locales)) {
    const buildings = await getBuildings(locale as LocaleType);
    const buildingParams = buildings.map((building) => ({
      locale,
      slug: building.slug,
    }));
    params.push(...buildingParams);
  }

  return params;
};

export default async function BuildingPage(props: Props) {
  const params = await props.params;

  const { slug, locale } = params;

  if (!slug) return notFound();
  const building = await getBuildingBySlug(locale, slug);
  if (!building) return notFound();
  const buildingImages = [
    (building.featuredImage as Media).url,
    ...(building.images as Media[]).map((img) => img.url),
  ].filter((img) => typeof img === "string");
  return (
    <>
      <BuildingStructuredData building={building} locale={locale} />
      <BuildingComponent building={building} buildingImages={buildingImages} />
    </>
  );
}
