"use client";

import { TileLayer, GeoJSON, MapContainer } from "react-leaflet";
import Image from "next/image";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Search } from "lucide-react";
import { BuildingTypes, CountryExtended } from "~/server/db/zodSchemaTypes";
import Divider from "../../_icons/divider";
import { createClient } from "~/supabase/client";
import Serbia from "../../_icons/serbia";
import clsx from "clsx";

export default function CountryPage({
  country,
  buildingTypes,
  countryJson,
}: {
  country: CountryExtended;
  buildingTypes: BuildingTypes[];
  countryJson: string | null;
}) {
  const [countiesSearch, setCountiesSearch] = useState("");
  const [citiesSearch, setCitiesSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [buildingTypeFilter, setBuildingTypeFilter] = useState<null | number>(
    null,
  );
  const supabase = createClient();

  return (
    <div>
      <h1 className="text-brown mb-8 text-4xl font-bold">{country.name}</h1>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Map Section */}
        <div className="relative h-[800px]">
          <Serbia />
        </div>

        {/* Decorative Divider */}
        <div className="hidden lg:block">
          <Divider />
        </div>

        {/* Lists Section */}
        <div className="flex max-h-[800px] w-full justify-center gap-4">
          {/* Counties */}
          <div className="relative w-1/2 overflow-hidden">
            <h2 className="text-brown mb-4 text-2xl font-bold">Counties</h2>
            <div className="relative mx-1 mb-4">
              <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4 bg-transparent" />
              <Input
                placeholder="search"
                value={countiesSearch}
                onChange={(e) => setCountiesSearch(e.target.value)}
                className="rounded-xl pl-8"
              />
            </div>
            <div className="grid h-4/5 gap-1 overflow-y-auto overflow-x-hidden">
              {country.regions
                .filter((region) =>
                  region.name
                    .toLowerCase()
                    .includes(countiesSearch.toLowerCase()),
                )
                .map((region) => (
                  <Button
                    key={region.id}
                    variant="ghost"
                    className="text-green font-source-sans-3 justify-start overflow-ellipsis font-semibold"
                  >
                    {region.name}
                  </Button>
                ))}
            </div>
          </div>

          {/* Cities */}
          <div className="relative w-1/2 overflow-hidden">
            <h2 className="text-brown mb-4 text-2xl font-bold">Cities</h2>
            <div className="relative mx-1 mb-4">
              <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4 bg-transparent" />
              <Input
                placeholder="search"
                value={citiesSearch}
                onChange={(e) => setCitiesSearch(e.target.value)}
                className="rounded-xl pl-8"
              />
            </div>
            <div className="grid h-4/5 gap-1 overflow-auto">
              {country.cities
                .filter((city) =>
                  city.name.toLowerCase().includes(citiesSearch.toLowerCase()),
                )
                .map((city) => (
                  <Button
                    key={city.id}
                    variant="ghost"
                    className="text-green font-source-sans-3 justify-start font-semibold"
                  >
                    {city.name}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-brown text-2xl font-bold">Articles</h2>
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

        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          {buildingTypes.map((buildingType) => (
            <Button
              key={buildingType.id}
              variant="outline"
              className={clsx(
                "hover:bg-green whitespace-nowrap hover:text-white",
                buildingTypeFilter === buildingType.id
                  ? "bg-green text-white"
                  : "text-green",
              )}
              onClick={() =>
                setBuildingTypeFilter((prev) =>
                  prev === buildingType.id ? null : buildingType.id,
                )
              }
            >
              {buildingType.name}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {country.buildings
            .filter(
              (building) =>
                building.name
                  .toLowerCase()
                  .includes(articleSearch.toLowerCase()) &&
                (!buildingTypeFilter ||
                  building.buildingtypeid === buildingTypeFilter),
            )
            .map((building) => {
              const {
                data: { publicUrl },
              } = supabase.storage
                .from("heritagebuilder-test")
                .getPublicUrl(building.img ?? "");

              return (
                <Card key={building.id} className="relative overflow-hidden">
                  <div className="aspect-square">
                    <Image
                      src={publicUrl}
                      alt={building.name ?? "Building"}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl">{building.name}</h3>
                  </div>
                </Card>
              );
            })}
        </div>
      </section>
    </div>
  );
}
