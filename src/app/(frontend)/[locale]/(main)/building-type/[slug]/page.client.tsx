"use client";

import { Building, BuildingType, City, Country, County } from "payload-types";
import { Suspense, useState } from "react";
import BuildingCard from "./building-card";
import FilterForm from "./filter-form";
import Pagination from "./pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const BuildingTypeClientPage = ({
  buildings,
  buildingType,
  country,
  county,
  city,
  counties,
  cities,
  countries,
  page,
  totalPages,
}: {
  buildings: Building[];
  buildingType: BuildingType;
  country?: string;
  county?: string;
  city?: string;
  counties: County[];
  cities: City[];
  countries: Country[];
  page: number;
  totalPages: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="container relative mx-auto flex flex-col">
      <h1 className="text-3xl font-bold text-brown">{buildingType.name}</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Skeleton className="h-10 w-full rounded-md sm:w-[150px] sm:min-w-[150px] sm:max-w-[300px] sm:flex-1" />
            <Skeleton className="h-10 w-full rounded-md sm:w-[150px] sm:min-w-[150px] sm:max-w-[300px] sm:flex-1" />
            <Skeleton className="h-10 w-full rounded-md sm:w-[150px] sm:min-w-[150px] sm:max-w-[300px] sm:flex-1" />
          </div>
        }
      >
        <FilterForm
          buildingType={buildingType.slug}
          country={country}
          county={county}
          city={city}
          counties={counties}
          cities={cities}
          countries={countries}
          setLoading={setIsLoading}
        />
      </Suspense>
      <ScrollArea className="mt-4 h-[calc(100vh-312px-56px)] pb-[72px]">
        <div className={cn("flex flex-wrap items-center justify-center gap-6")}>
          {buildings.map((building) => (
            <Link
              key={building.id}
              href={{
                pathname: "/building/[slug]",
                params: { slug: building.slug },
              }}
            >
              <BuildingCard
                key={building.id}
                building={building}
                loading={isLoading}
              />
            </Link>
          ))}
        </div>
      </ScrollArea>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
};
