"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { BuildingTypes, CountryExtended } from "@/server/db/zodSchemaTypes";
import Divider from "../../../../components/icons/divider";
import { createClient } from "@/supabase/client";
import Serbia from "../../../../components/icons/serbia";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CountryPage({
  country,
  buildingTypes,
}: {
  country: CountryExtended;
  buildingTypes: BuildingTypes[];
}) {
  const [countiesSearch, setCountiesSearch] = useState("");
  const [citiesSearch, setCitiesSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [buildingTypeFilter, setBuildingTypeFilter] = useState<null | number>(
    null,
  );
  const supabase = createClient();
  console.log(country);
  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold text-brown">{country.name}</h1>

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
            <h2 className="mb-4 text-2xl font-bold text-brown">Counties</h2>
            <div className="relative mx-1 mb-4">
              <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4 bg-transparent" />
              <Input
                placeholder="search"
                value={countiesSearch}
                onChange={(e) => setCountiesSearch(e.target.value)}
                className="rounded-xl pl-8"
              />
            </div>
            <ScrollArea className="grid h-4/5 gap-1 overflow-x-hidden">
              {country.counties
                .filter((county) =>
                  county.name
                    .toLowerCase()
                    .includes(countiesSearch.toLowerCase()),
                )
                .map((county) => (
                  <Button
                    key={county.id}
                    variant="ghost"
                    className="w-full justify-start overflow-ellipsis font-source-sans-3 font-semibold text-green"
                  >
                    {county.name}
                  </Button>
                ))}
            </ScrollArea>
          </div>

          {/* Cities */}
          <div className="relative w-1/2 overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-brown">Cities</h2>
            <div className="relative mx-1 mb-4">
              <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4 bg-transparent" />
              <Input
                placeholder="search"
                value={citiesSearch}
                onChange={(e) => setCitiesSearch(e.target.value)}
                className="rounded-xl pl-8"
              />
            </div>
            <ScrollArea className="grid h-4/5 gap-1 overflow-x-hidden">
              {country.cities
                .filter((city) =>
                  city.name.toLowerCase().includes(citiesSearch.toLowerCase()),
                )
                .map((city) => (
                  <Button
                    key={city.id}
                    variant="ghost"
                    className="w-full justify-start font-source-sans-3 font-semibold text-green"
                  >
                    {city.name}
                  </Button>
                ))}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brown">Articles</h2>
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
              className={cn(
                "whitespace-nowrap hover:bg-green hover:text-white",
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
                .getPublicUrl(building.featuredImage ?? "");

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
