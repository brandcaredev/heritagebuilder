import { api } from "@/trpc/server";
import NewBuildingForm from "@/_components/new-building";

export default async function NewBuilding(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const buildingTypes = await api.buildingType.getBuildingTypes({
    lang: locale,
  });

  return <NewBuildingForm buildingTypes={buildingTypes} />;
}
