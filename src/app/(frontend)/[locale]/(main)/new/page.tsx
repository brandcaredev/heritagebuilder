import NewBuildingForm from "@/_components/new-building";
import { LocaleType } from "@/lib/constans";
import { getBuildingTypes } from "@/lib/queries";

export default async function NewBuilding(props: {
  params: Promise<{ locale: LocaleType }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const buildingTypes = await getBuildingTypes(locale);

  return <NewBuildingForm buildingTypes={buildingTypes} />;
}
