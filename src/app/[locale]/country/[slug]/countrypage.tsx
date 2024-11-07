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
  const supabase = createClient();

  return (
    <div className="bg-background min-h-screen p-6">
      <h1 className="text-brown mb-8 text-4xl font-bold">{country.name}</h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Map Section */}
        <div className="relative h-[600px] w-full overflow-hidden rounded-lg border lg:w-2/3">
          <MapContainer
            center={country.position ?? [44.0165, 21.0059]}
            zoom={7}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {countryJson && <GeoJSON data={JSON.parse(countryJson)} />}
          </MapContainer>
        </div>

        {/* Decorative Divider */}
        <div className="hidden lg:block">
          <Divider />
        </div>

        {/* Lists Section */}
        <div className="flex justify-center gap-10">
          {/* Counties */}
          <div className="overflow-hidden">
            <h2 className="text-brown mb-4 text-2xl font-bold">Counties</h2>
            <div className="relative mb-4">
              <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4 bg-transparent" />
              <Input
                placeholder="search"
                value={countiesSearch}
                onChange={(e) => setCountiesSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="grid max-h-[600px] gap-2 overflow-y-auto overflow-x-hidden">
              {country.regions.map((region) => (
                <Button
                  key={region.id}
                  variant="ghost"
                  className="text-green font-source-sans-3 justify-start font-semibold"
                >
                  {region.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div>
            <h2 className="text-brown mb-4 text-2xl font-bold">Cities</h2>
            <div className="relative mb-4">
              <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4 bg-transparent" />
              <Input
                placeholder="search"
                value={citiesSearch}
                onChange={(e) => setCitiesSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="grid max-h-[600px] gap-2 overflow-auto">
              {country.cities.map((city) => (
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
            <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
            <Input
              placeholder="search"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          {buildingTypes.map((buildingType) => (
            <Button
              key={buildingType.id}
              variant="outline"
              className="whitespace-nowrap"
            >
              {buildingType.name}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {country.buildings.map((building) => {
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
                    width={50}
                    height={50}
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
