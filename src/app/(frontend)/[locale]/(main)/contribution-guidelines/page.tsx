import BuildingList from "@/_components/building-list";
import RichText from "@/_components/richtext";
import type { LocaleType } from "@/lib/constans";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getBuildings } from "@/lib/queries/building";
import { getTranslations } from "next-intl/server";
import { Divider } from "@/components/icons/divider";
import { getCommunityContent } from "@/lib/queries/community";

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

const CommunityPage = async (props: Props) => {
  const { locale } = await props.params;
  const t = await getTranslations();
  const communityContent = await getCommunityContent(locale);
  const [buildingTypes, buildings] = await Promise.all([
    getBuildingTypes(locale),
    getBuildings(locale, 6, "-createdAt"),
  ]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-8">
        <div className="flex w-fit flex-col">
          <h1 className="text-brown text-4xl font-bold">
            {t("page.contributionGuidelines")}
          </h1>
          <Divider orientation="horizontal" />
        </div>
        <div className="border-brown-100/50 shadow-brown-900/5 bg-brown-50 rounded-4xl border p-6 shadow-sm md:p-10">
          {communityContent && (
            <div className="lg:px-10">
              <RichText
                className="text-brown-700 mt-6"
                data={communityContent}
                enableGutter={false}
              />
            </div>
          )}
        </div>

        <div>
          <BuildingList
            buildings={buildings}
            buildingTypes={buildingTypes}
            hideFilters
            totalPages={1}
            page={1}
            title={t("page.recommendedBuildings")}
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
