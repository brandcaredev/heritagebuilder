import type { LocaleType } from "@/lib/constans";
import { getBuildings } from "@/lib/queries/building";
import AllBuildingsMapClient from "./index.client";

const AllBuildingsMap = async ({ locale }: { locale: LocaleType }) => {
  const allBuildings = await getBuildings(locale);
  return <AllBuildingsMapClient allBuildings={allBuildings} />;
};
export default AllBuildingsMap;
