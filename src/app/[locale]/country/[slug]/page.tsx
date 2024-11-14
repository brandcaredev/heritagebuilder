import { notFound } from "next/navigation";
import { createClient } from "~/supabase/server";
import { api } from "~/trpc/server";
import CountryPage from "./countrypage";
export default async function MainPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  if (!slug) return notFound();
  const country = await api.country.getCountryBySlug({ slug });
  const buildingTypes = await api.buildingType.getBuildingTypes();
  const supabase = await createClient();
  if (!country) return notFound();
  const { data } = await supabase.storage
    .from("heritagebuilder-test")
    .download(`country/geojson/${country.slug}.json`)
    .then(async (res) => {
      if (res.error) {
        return res;
      }
      return {
        data: await res.data.text(),
        error: null,
      };
    });

  return (
    <CountryPage
      country={country}
      buildingTypes={buildingTypes}
      countryJson={data}
    />
  );
}
