import { IBuilding } from "@/server/db/zodSchemaTypes";
import { api } from "@/trpc/server";
import dynamic from "next/dynamic";
const BuildingsMap = dynamic(() => import("@/_components/buildings-map"), {
  ssr: false,
});

export default async function MapPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const buildings = await api.building.getAcceptedBuildings({ lang: locale });

  return (
    <BuildingsMap
      buildings={buildings as IBuilding[]}
      //footer 248 padding 2*32 header 48
      className="max-w-screen h-[calc(100vh-48px-70px)] md:-m-8 md:h-[calc(100vh-248px-48px)]"
    />
  );
}
