import BuildingComponent from "@/_components/building";
import { LocaleType } from "@/lib/constans";
import { getBuildingBySlug } from "@/lib/queries/building";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { Media } from "payload-types";

export default async function BuildingPage(props: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}) {
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
    <BuildingComponent building={building} buildingImages={buildingImages} />
  );
}
