import NewBuildingForm from "@/_components/new-building";
import { LocaleType } from "@/lib/constans";
import { getBuildings } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountriesCodes } from "@/lib/queries/country";

export default async function NewBuilding(props: {
  params: Promise<{ locale: LocaleType }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const buildingTypes = await getBuildingTypes(locale);
  const countries = await getCountriesCodes();

  return (
    <NewBuildingForm buildingTypes={buildingTypes} countries={countries} />
  );
}
