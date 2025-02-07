"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { City, Country, County } from "payload-types";

export default function FilterForm({
  countries,
  cities,
  counties,
  country,
  county,
  city,
  buildingType,
  setLoading,
}: {
  buildingType: string;
  countries: Country[];
  cities: City[];
  counties: County[];
  country?: string;
  county?: string;
  city?: string;
  setLoading: (isLoading: boolean) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (
    filterType: string,
    value: string | undefined,
  ) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (filterType === "country") {
      params.delete("city");
      params.delete("county");
    }
    if (filterType === "county") {
      params.delete("city");
    }
    if (value === undefined) {
      params.delete(filterType);
    } else {
      params.set(filterType, value);
    }
    params.set("page", "1"); // Reset to first page on filter change
    router.push({
      pathname: `/building-type/[slug]`,
      params: { slug: buildingType },
      query: Object.fromEntries(params.entries()),
    });
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="mt-4 flex flex-col justify-center gap-6 sm:flex-row sm:flex-wrap">
      <Select
        onValueChange={(value) => handleFilterChange("country", value)}
        value={country || ""}
      >
        <SelectTrigger
          className="w-full sm:w-[150px] sm:min-w-[150px] sm:max-w-[300px] sm:flex-1"
          onReset={() => handleFilterChange("country", undefined)}
          value={country || ""}
        >
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.slug} value={country.slug}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => handleFilterChange("county", value)}
        value={county || ""}
        disabled={counties.length === 0}
      >
        <SelectTrigger
          className="w-full sm:w-[150px] sm:min-w-[150px] sm:max-w-[300px] sm:flex-1"
          onReset={() => handleFilterChange("county", undefined)}
          value={county || ""}
        >
          <SelectValue placeholder="Select County" />
        </SelectTrigger>
        <SelectContent>
          {counties.map((county) => (
            <SelectItem key={county.slug} value={county.slug}>
              {county.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => handleFilterChange("city", value)}
        value={city || ""}
        disabled={cities.length === 0}
      >
        <SelectTrigger
          className="w-full sm:w-[150px] sm:min-w-[150px] sm:max-w-[300px] sm:flex-1"
          onReset={() => handleFilterChange("city", undefined)}
          value={city || ""}
        >
          <SelectValue placeholder="Select City" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.slug} value={city.slug}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
