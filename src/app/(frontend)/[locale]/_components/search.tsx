"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks";
import { useLocale } from "next-intl";
import { api } from "@/trpc/react";
import { useRouter } from "@/i18n/routing";

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
  const locale = useLocale();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value);

  const { data: searchResults, isLoading } = api.building.search.useQuery(
    { q: debouncedValue, lang: locale },
    {
      enabled: isExpanded && debouncedValue.length > 0,
    },
  );
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search submission here
    console.log("Search submitted:", inputRef.current?.value);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`w-5 rounded-full transition-all duration-300 ease-in-out hover:text-stone-300 ${isExpanded && "mr-2"}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Close search" : "Open search"}
        >
          <Search className="h-5 w-5" />
        </Button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "w-40 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="relative">
            <Input
              ref={inputRef}
              onChange={(e) => setValue(e.target.value)}
              value={value}
              type="search"
              placeholder="Search..."
              className="focus:none h-7 w-full rounded-l pl-2 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Search input"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </form>
      {/* Search Results Dropdown */}
      {isExpanded && searchResults && searchResults.length > 0 && (
        <div className="border-border absolute left-0 right-0 top-full z-50 mt-2 max-h-[300px] w-80 overflow-y-auto rounded-lg border bg-white shadow-lg">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="hover:bg-muted cursor-pointer p-3"
              onClick={() => {
                setIsExpanded(false);
                router.push({
                  pathname: `/building/[slug]`,
                  params: {
                    slug: result.slug,
                  },
                });
              }}
            >
              <div className="flex flex-wrap items-center gap-x-1 text-base">
                <span className="text-brown-4">
                  {highlightText(result.name, debouncedValue)}
                </span>
                {typeof result.buildingType !== "number" && (
                  <>
                    <span className="text-brown">•</span>
                    <span className="text-brown">
                      {highlightText(result.buildingType.name, debouncedValue)}
                    </span>
                  </>
                )}
                <span className="text-brown">•</span>
                <span className="break-all text-brown">
                  {highlightText(
                    `${result.country}, ${result.city}`,
                    debouncedValue,
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpandableSearch;
