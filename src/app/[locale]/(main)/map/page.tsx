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
  const buildings = await api.building.getBuildings({ lang: locale });

  return <BuildingsMap buildings={buildings} />;
}
