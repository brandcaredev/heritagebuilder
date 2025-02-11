"use client";

import { Divider, Romania, Serbia } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useRouter } from "@/i18n/routing";
import { cn, getURL } from "@/lib/utils";
import clsx from "clsx";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { BuildingType, City, Country, County, Media } from "payload-types";
import { useState } from "react";

export default function CountryPage({
  country,
  buildingTypes,
}: {
  country: Country;
  buildingTypes: BuildingType[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [countiesSearch, setCountiesSearch] = useState("");
  const [citiesSearch, setCitiesSearch] = useState("");

  const countryCounties = (country.relatedCounties?.docs as County[]) || [];
  const countryCities = (country.relatedCities?.docs as City[]) || [];
  const onMapCountyClick = (id: number) => {
    const selectedCounty = countryCounties.find((c) => c.id === id);
    if (selectedCounty) {
      router.push({
        pathname: "/county/[slug]",
        params: { slug: selectedCounty.slug },
      });
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-brown">{country.name}</h1>
      <div className="mt-16 flex flex-col gap-10 lg:flex-row">
        {/* Map Section */}
        <div
          className={clsx(
            "relative",
            country.countryCode === "ro" ? "h-[440px]" : "h-[720px]",
          )}
        >
          {country.countryCode === "ro" ? (
            <Romania onClick={(id) => onMapCountyClick(id)} />
          ) : (
            <Serbia onClick={(id) => onMapCountyClick(id)} />
          )}
        </div>

        {/* Decorative Divider */}
        <div className="hidden lg:block">
          <Divider />
        </div>

        {/* Lists Section */}
        <div
          className={cn(
            "flex w-full justify-center gap-4",
            country.countryCode === "ro"
              ? "lg:max-h-[440px]"
              : "lg:max-h-[720px]",
          )}
        >
          {/* Counties */}
          <div className="relative w-1/2 overflow-hidden">
            <h2 className="mb-4 text-2xl font-bold text-brown">
              {t("common.counties")}
            </h2>
            <div className="relative mx-1 mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 bg-transparent" />
              <Input
                placeholder={t("common.search")}
                value={countiesSearch}
                onChange={(e) => setCountiesSearch(e.target.value)}
                className="rounded-xl pl-8"
              />
            </div>
            <ScrollArea className="grid h-4/5 gap-1 overflow-x-hidden pb-4">
              {countryCounties
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
            <h2 className="mb-4 text-2xl font-bold text-brown">
              {t("common.cities")}
            </h2>
            <div className="relative mx-1 mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 bg-transparent" />
              <Input
                placeholder={t("common.search")}
                value={citiesSearch}
                onChange={(e) => setCitiesSearch(e.target.value)}
                className="rounded-xl pl-8"
              />
            </div>
            <ScrollArea className="grid h-4/5 gap-1 overflow-x-hidden">
              {countryCities
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
      <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {buildingTypes.map((type) => {
          return (
            <Link
              key={type.id}
              href={{
                pathname: "/building-type/[slug]",
                params: { slug: type.slug },
                query: { country: country.slug },
              }}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={`${getURL()}${(type.image as Media).url}`}
                alt={type.name ?? t("page.buildingTypeImageAlt")}
                width={200}
                height={200}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h3 className="absolute bottom-2 left-2 text-sm text-white">
                {type.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </>
  );
}
