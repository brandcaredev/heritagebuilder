"use client";
import { usePathname } from "@/i18n/routing";
import { LocaleType } from "@/lib/constans";
import { api } from "@/trpc/react";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useTransition } from "react";

const languages = [
  { label: "EN", value: "en", flag: "🇬🇧" },
  { label: "HU", value: "hu", flag: "🇭🇺" },
];

type SlugPages =
  | "country"
  | "city"
  | "region"
  | "county"
  | "building-type"
  | "building";
type Params = { slug: string; locale: LocaleType };

export default function LocaleSwitcher() {
  const trpc = api.useUtils();
  const locale = useLocale();
  const router = useRouter();
  const [_isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  const getLocaleEntitySlug = async (
    type: SlugPages,
    params: { slug: string; locale: LocaleType },
    nextLocale: LocaleType,
  ) => {
    switch (type) {
      case "country":
        return await trpc.country.getLanguageCountrySlug.fetch({
          slug: params.slug,
          nextLang: nextLocale,
        });
      case "city":
        return await trpc.city.getLanguageCitySlug.fetch({
          slug: params.slug,
          nextLang: nextLocale,
        });
      // case "region":
      //   return await trpc.region.getLanguageRegionSlug.fetch({
      //     slug: params.slug,
      //     lang: locale,
      //     nextLang: nextLocale,
      //   });
      case "county":
        return await trpc.county.getLanguageCountySlug.fetch({
          slug: params.slug,
          nextLang: nextLocale,
        });
      case "building-type":
        return await trpc.buildingType.getLanguageBuildingTypeSlug.fetch({
          slug: params.slug,
          nextLang: nextLocale,
        });
      case "building":
        return await trpc.building.getLanguageBuildingSlug.fetch({
          slug: params.slug,
          nextLang: nextLocale,
        });
      default:
        return undefined;
    }
  };

  const onSelectChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as LocaleType;
    const slugPage = pathname.split("/")[1];
    const nextSlug = slugPage
      ? await getLocaleEntitySlug(
          slugPage as SlugPages,
          params as Params,
          nextLocale,
        )
      : undefined;
    startTransition(() =>
      nextSlug
        ? router.replace(`/${nextLocale}/${slugPage}/${nextSlug}`)
        : router.replace(`/${nextLocale}/${pathname}`),
    );
  };
  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={onSelectChange}
        className="flex appearance-none items-center rounded border border-gray-300 bg-transparent px-3 py-1 pr-8 text-sm leading-tight focus:border-blue-500 focus:outline-none"
      >
        {languages.map((language) => (
          <option
            key={language.value}
            value={language.value}
            className="flex items-center"
          >
            {language.flag} {language.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
