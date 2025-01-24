"use client";

import { Building, BuildingType, City, Country, County } from "payload-types";
import { Suspense, useState } from "react";
import BuildingCard from "./building-card";
import FilterForm from "./filter-form";
import Pagination from "./pagination";

export const BuildingTypePage = ({
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
    <div className="container relative mx-auto flex flex-col space-y-4">
      <h1 className="text-3xl font-bold text-brown">{buildingType.name}</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
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
      <div className="flex flex-wrap gap-6">
        {buildings.map((building) => (
          <BuildingCard
            key={building.id}
            building={building}
            loading={isLoading}
          />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
};
