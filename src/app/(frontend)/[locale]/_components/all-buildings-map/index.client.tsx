"use client";
import dynamic from "next/dynamic";
import type { Building } from "payload-types";

const BuildingsMap = dynamic(() => import("@/_components/buildings-map"), {
  ssr: false,
});

const AllBuildingsMapClient = ({
  allBuildings,
}: { allBuildings: Building[] }) => {
  return <BuildingsMap buildings={allBuildings} className="h-96 w-full" />;
};

export default AllBuildingsMapClient;
