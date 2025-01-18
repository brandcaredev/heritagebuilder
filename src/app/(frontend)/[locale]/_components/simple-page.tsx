"use client";
import { cn } from "@/lib/utils";
import { Building, BuildingType } from "payload-types";
import BuildingList from "./building-list";
import BuildingsMap from "./buildings-map";

const SimplePage = ({
  name,
  description,
  buildings,
  position,
  buildingTypes,
}: {
  name: string;
  description?: string | null;
  buildings: Building[];
  position?: [number, number] | null;
  buildingTypes: BuildingType[];
}) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-brown-800 text-4xl font-bold">{name}</h1>
      <div className="flex h-fit flex-col gap-4 lg:flex-row">
        {description && (
          <div
            className={cn(
              "flex justify-center px-6",
              position ? "w-full lg:w-1/2" : "w-full",
            )}
          >
            <p className="text-brown-700 mt-6">{description}</p>
          </div>
        )}
        {position && (
          <BuildingsMap
            center={position}
            zoom={9}
            className={cn(
              "rounded-lg",
              description ? "h-[400px] w-full lg:w-1/2" : "h-[400px] w-full",
            )}
            buildings={buildings}
          />
        )}
      </div>
      <BuildingList buildings={buildings} buildingTypes={buildingTypes} />
    </div>
  );
};
export default SimplePage;
