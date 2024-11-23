import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import BuildingComponent from "../../_components/building";
import { createClient } from "@/supabase/server";

export default async function BuildingPage({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}) {
  if (!slug) return notFound();
  const building = await api.building
    .getBuildingBySlug({
      slug,
      lang: locale,
    })
    .catch(() => null);
  if (!building) return notFound();

  const supabase = await createClient();

  building.featuredImage = supabase.storage
    .from("heritagebuilder-test")
    .getPublicUrl(building.featuredImage ?? "").data.publicUrl;
  building.images = await Promise.all(
    building.images.map(async (image) => {
      const { data } = supabase.storage
        .from("heritagebuilder-test")
        .getPublicUrl(image);
      return data.publicUrl;
    }),
  );
  return <BuildingComponent building={building} />;
}
