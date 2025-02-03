import { LocaleType } from "@/lib/constans";
import { getBuildings } from "@/lib/queries/building";
import BuildingsMap from "@/_components/buildings-map";

export default async function MapPage(props: {
  params: Promise<{ locale: LocaleType }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const buildings = await getBuildings(locale);

  return (
    <BuildingsMap
      buildings={buildings}
      //footer 248 padding 2*32 header 56
      className="max-w-screen h-[calc(100vh-48px-70px)] md:-m-8 md:h-[calc(100vh-312px-56px)]"
    />
  );
}
