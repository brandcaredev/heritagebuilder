"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CityWithTranslations,
  type CountryExtendedWithTranslations,
  type CountyWithTranslations,
} from "@/server/db/zodSchemaTypes";
import { api } from "@/trpc/react";
import { useState } from "react";
import EditLocation from "./edit-location";

export default function LocationManager({
  countries,
}: {
  countries: CountryExtendedWithTranslations[];
}) {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryExtendedWithTranslations | null>(null);
  const [selectedCounty, setSelectedCounty] =
    useState<CountyWithTranslations | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityWithTranslations | null>(
    null,
  );
  const [editMode, setEditMode] = useState<"county" | "city" | null>(null);

  const handleEdit = (type: "county" | "city") => {
    setEditMode(type);
  };

  if (!countries) return null;

  if (editMode && (selectedCounty || selectedCity)) {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setEditMode(null)}
          className="mb-4"
        >
          Back to List
        </Button>
        <EditLocation
          type={editMode}
          locationData={editMode === "county" ? selectedCounty! : selectedCity!}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select Location</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Country</label>
            <Select
              value={selectedCountry?.id ?? undefined}
              onValueChange={(value) => {
                setSelectedCountry(countries.find((c) => c.id === value)!);
                setSelectedCounty(null);
                setSelectedCity(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country: CountryExtendedWithTranslations) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCountry && (
            <div>
              <label className="mb-2 block text-sm font-medium">County</label>
              <Select
                value={selectedCounty?.id.toString() ?? ""}
                onValueChange={(value) => {
                  setSelectedCounty(
                    selectedCountry.counties.find(
                      (c) => c.id === parseInt(value),
                    )!,
                  );
                  setSelectedCity(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCountry.counties.map(
                    (county: CountyWithTranslations) => (
                      <SelectItem key={county.id} value={county.id.toString()}>
                        {county.hu.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedCountry && (
            <div>
              <label className="mb-2 block text-sm font-medium">City</label>
              <Select
                value={selectedCity?.id.toString() ?? ""}
                onValueChange={(value) => {
                  setSelectedCity(
                    selectedCountry.cities.find(
                      (c) => c.id === parseInt(value),
                    )!,
                  );
                  setSelectedCounty(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCountry.cities.map((city: CityWithTranslations) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.hu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Location Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {selectedCounty && (
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-medium">
                Selected County: {selectedCounty?.hu.name}
              </h3>
              <Button onClick={() => handleEdit("county")} className="w-full">
                Edit County Details
              </Button>
            </Card>
          )}

          {selectedCity && (
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-medium">
                Selected City: {selectedCity?.hu.name}
              </h3>
              <Button onClick={() => handleEdit("city")} className="w-full">
                Edit City Details
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
