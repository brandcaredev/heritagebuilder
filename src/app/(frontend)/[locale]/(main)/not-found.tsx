import { getBuildings } from "@/lib/queries/building";
import BuildingList from "../_components/building-list";
import { NotFoundComponent } from "../_components/not-found";
import { LocaleType } from "@/lib/constans";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getLocale, getTranslations } from "next-intl/server";

const NotFound = async () => {
  const locale = await getLocale();
  const buildings = await getBuildings(locale as LocaleType, 10);
  const buildingTypes = await getBuildingTypes(locale as LocaleType);
  const t = await getTranslations();

  return (
    <div className="container mx-auto mt-4 flex flex-col">
      <NotFoundComponent />
      <BuildingList
        buildings={buildings}
        hideFilters
        totalPages={1}
        page={1}
        title={t("page.recommendedBuildings")}
        buildingTypes={buildingTypes}
      />
    </div>
  );
};

export default NotFound;
