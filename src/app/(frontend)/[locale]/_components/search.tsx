"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "@/i18n/routing";
import { useDebounce } from "@/lib/hooks";
import { api } from "@/trpc/react";
import { Loader2, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function highlightText(text: string, query: string) {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-transparent font-bold text-green">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

const ExpandableSearch = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value);

  const { data: searchResults, isLoading } = api.building.search.useQuery(
    { q: debouncedValue, lang: locale },
    {
      enabled: isOpen && debouncedValue.length > 0,
    },
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search submission here
    console.log("Search submitted:", inputRef.current?.value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-5 rounded-full transition-all duration-300 ease-in-out hover:text-stone-300"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        noOverlay
        side="top"
        className="top-[56px] h-[50vh] overflow-y-auto bg-white-2"
      >
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">
              {t("common.search")}
            </SheetTitle>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="relative">
              <Input
                ref={inputRef}
                onChange={(e) => setValue(e.target.value)}
                value={value}
                type="search"
                placeholder={t("common.search")}
                className="h-10 w-full pl-10 pr-4"
                aria-label="Search input"
              />
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </form>
          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="cursor-pointer rounded-lg p-3 hover:bg-brown-100/70"
                  onClick={() => {
                    setIsOpen(false);
                    router.push({
                      pathname: `/building/[slug]`,
                      params: {
                        slug: result.slug,
                      },
                    });
                  }}
                >
                  <div className="flex flex-wrap items-center gap-x-1 text-base">
                    <span className="text-brown-900">
                      {highlightText(result.name, debouncedValue)}
                    </span>
                    {typeof result.buildingType !== "number" && (
                      <>
                        <span className="text-brown">•</span>
                        <span className="text-brown">
                          {highlightText(
                            result.buildingType.name,
                            debouncedValue,
                          )}
                        </span>
                      </>
                    )}
                    <span className="text-brown">•</span>
                    <span className="break-all text-brown">
                      {highlightText(
                        `${result.city ?? ""} ${result.city && result.country ? ", " : ""} ${result.country ?? ""}`,
                        debouncedValue,
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExpandableSearch;
