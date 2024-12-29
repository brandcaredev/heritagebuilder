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

  return <BuildingsMap buildings={buildings as IBuilding[]} />;
}
