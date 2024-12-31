import { api } from "@/trpc/server";
import NewBuildingForm from "@/_components/new-building";

export default async function NewBuilding({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const buildingTypes = await api.buildingType.getBuildingTypes({
    lang: locale,
  });

  return <NewBuildingForm buildingTypes={buildingTypes} />;
}
