"use client";

import { Input } from "@/components/ui";
import { Toggle } from "@/components/ui/toggle";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Building, BuildingType } from "payload-types";
import { useState } from "react";
import BuildingCard from "../(main)/building-type/[slug]/building-card";
import Pagination from "../(main)/building-type/[slug]/pagination";

const BuildingList = ({
  buildingTypes,
  buildings,
  buildingTypeFilter,
  totalPages,
  page,
  title,
  searchPage,
  hideFilters,
}: {
  buildingTypes: BuildingType[];
  buildings: Building[];
  buildingTypeFilter?: string;
  totalPages: number;
  page: number;
  title?: string;
  searchPage?: boolean;
  hideFilters?: boolean;
}) => {
  const t = useTranslations();
  const router = useRouter();
  const [articleSearch, setArticleSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleFilterChange = (
    filterType: "search" | "building-type",
    value: string | undefined,
  ) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (filterType === "building-type") {
      if (value === undefined) {
        params.delete("buildingType");
      } else {
        params.set("buildingType", value);
      }
    } else if (filterType === "search") {
      if (value === "" || value === undefined) {
        params.delete("q");
      } else {
        params.set("q", value);
      }
    }
    params.set("page", "1"); // Reset to first page on filter change

    //@ts-expect-error
    router.push(`?${params.toString()}`, { scroll: false }); // Prevent page scroll
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    router.push({
      pathname: "/search/[slug]",
      params: { slug: articleSearch },
    });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <h2
          className={cn("text-2xl font-bold text-brown", title && "text-4xl")}
        >
          {title ? title : t("common.buildings")}
        </h2>
        {!hideFilters && (
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              if (searchPage) {
                if (!articleSearch) return;
                handleSubmit();
              } else {
                handleFilterChange("search", articleSearch);
              }
            }}
            className="mt-4"
          >
            <div className="relative w-72">
              <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
              <Input
                placeholder={t("common.search")}
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="rounded-xl pl-8"
                type="search"
              />
            </div>
          </form>
        )}
      </div>
      {!hideFilters && (
        <div className="mb-8 flex items-center gap-4 overflow-x-auto rounded-sm bg-brown-200 p-2">
          <span className="text-brown-dark-20 text-lg font-semibold">
            {t("common.filter")}
          </span>
          {buildingTypes.map((buildingType, index) => (
            <Toggle
              pressed={buildingType.slug === buildingTypeFilter}
              key={"type" + index}
              variant="filter"
              onClick={() =>
                handleFilterChange(
                  "building-type",
                  buildingType.slug === buildingTypeFilter
                    ? undefined
                    : buildingType.slug,
                )
              }
            >
              <p>{buildingType.name}</p>
            </Toggle>
          ))}
        </div>
      )}
      <div
        className={cn(
          "relative flex flex-wrap items-center justify-center gap-6",
          totalPages > 1 && "pb-[72px]",
        )}
      >
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
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
};

export default BuildingList;
