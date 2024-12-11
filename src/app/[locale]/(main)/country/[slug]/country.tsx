"use client";

import BuildingList from "@/app/[locale]/_components/building-list";
import Divider from "@/components/icons/divider";
import Serbia from "@/components/icons/serbia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/routing";
import {
  type BuildingTypes,
  type CountryExtended,
} from "@/server/db/zodSchemaTypes";
import { Search } from "lucide-react";
import { useState } from "react";

export default function CountryPage({
  country,
  buildingTypes,
}: {
  country: CountryExtended;
  buildingTypes: BuildingTypes[];
}) {
  const [countiesSearch, setCountiesSearch] = useState("");
  const [citiesSearch, setCitiesSearch] = useState("");

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
                  <Link
                    key={county.id}
                    href={{
                      pathname: "/county/[slug]",
                      params: { slug: county.slug },
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start overflow-ellipsis font-source-sans-3 font-semibold text-green"
                    >
                      {county.name}
                    </Button>
                  </Link>
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
                  <Link
                    key={city.id}
                    href={{
                      pathname: "/city/[slug]",
                      params: { slug: city.slug },
                    }}
                  >
                    <Button
                      key={city.id}
                      variant="ghost"
                      className="w-full justify-start font-source-sans-3 font-semibold text-green"
                    >
                      {city.name}
                    </Button>
                  </Link>
                ))}
            </ScrollArea>
          </div>
        </div>
      </div>

      <BuildingList
        buildingTypes={buildingTypes}
        buildings={country.buildings}
      />
    </div>
  );
}
