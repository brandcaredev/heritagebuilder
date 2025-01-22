"use client";

import { Input } from "@/components/ui";
import { Toggle } from "@/components/ui/toggle";
import { Link } from "@/i18n/routing";
import { Search } from "lucide-react";
import Image from "next/image";
import { Building, BuildingType, Media } from "payload-types";
import { useState } from "react";

const BuildingList = ({
  buildingTypes,
  buildings,
}: {
  buildingTypes: BuildingType[];
  buildings: Building[];
}) => {
  const [articleSearch, setArticleSearch] = useState("");
  const [buildingTypeFilter, setBuildingTypeFilter] = useState<null | number>(
    null,
  );
  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brown">Buildings</h2>
        <div className="relative w-72">
          <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
          <Input
            placeholder="search"
            value={articleSearch}
            onChange={(e) => setArticleSearch(e.target.value)}
            className="rounded-xl pl-8"
          />
        </div>
      </div>

      <div className="bg-brown-200 mb-8 flex items-center gap-4 overflow-x-auto rounded-sm p-2">
        <span className="text-brown-dark-20 text-lg font-semibold">Filter</span>
        {buildingTypes.map((buildingType, index) => (
          <Toggle
            key={"type" + index}
            variant="filter"
            onClick={() =>
              setBuildingTypeFilter((prev) =>
                prev === buildingType.id ? null : buildingType.id,
              )
            }
          >
            <p>{buildingType.name}</p>
          </Toggle>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {buildings
          .filter(
            (building) =>
              building.name
                .toLowerCase()
                .includes(articleSearch.toLowerCase()) &&
              (!buildingTypeFilter ||
                (building.buildingType as BuildingType).id ===
                  buildingTypeFilter),
          )
          .map((building, index) => {
            return (
              <Link
                key={"building" + index}
                href={{
                  pathname: "/building/[slug]",
                  params: { slug: building.slug },
                }}
              >
                <div className="flex h-full w-full items-center">
                  <Image
                    src={(building.featuredImage as Media).url ?? ""}
                    alt={building.name ?? "Building"}
                    width={100}
                    height={100}
                    className="aspect-square object-cover"
                  />
                  <div className="flex p-4">
                    <h3 className="text-xl">{building.name}</h3>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default BuildingList;
