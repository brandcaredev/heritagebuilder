"use client";
import { Icons } from "@/components/icons";
import { usePathname, useRouter } from "@/i18n/routing";
import type { LocaleType } from "@/lib/constans";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";

const languages = [
  { label: "EN", value: "en", flag: Icons.enFlag },
  { label: "HU", value: "hu", flag: Icons.hunFlag },
] as const;

type SlugPages = "country" | "city" | "county" | "building-type" | "building";
type DynamicPathname =
  | "/country/[slug]"
  | "/county/[slug]"
  | "/city/[slug]"
  | "/region/[slug]"
  | "/building-type/[slug]"
  | "/building/[slug]"
  | "/guide/[slug]"
  | "/search/[slug]";

const LocaleSwitcher = () => {
  const trpc = api.useUtils();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();

  const getLocaleEntitySlug = async (
    type: SlugPages,
    slug: string,
    nextLocale: LocaleType,
  ) => {
    switch (type) {
      case "country":
        return await trpc.country.getLanguageCountrySlug.fetch({
          slug,
          nextLang: nextLocale,
        });
      case "city":
        return await trpc.city.getLanguageCitySlug.fetch({
          slug,
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
          slug,
          nextLang: nextLocale,
        });
      case "building-type":
        return await trpc.buildingType.getLanguageBuildingTypeSlug.fetch({
          slug,
          nextLang: nextLocale,
        });
      case "building":
        return await trpc.building.getLanguageBuildingSlug.fetch({
          slug,
          nextLang: nextLocale,
        });
      default:
        return undefined;
    }
  };

  const onButtonClick = async () => {
    const nextLocale = locale === "en" ? "hu" : "en";
    const slugPage = pathname.split("/")[1];
    const nextSlug =
      params.slug && slugPage
        ? await getLocaleEntitySlug(
            slugPage as SlugPages,
            params.slug,
            nextLocale,
          )
        : undefined;
    const href = pathname.includes("[slug]")
      ? {
          pathname: pathname as DynamicPathname,
          params: { slug: nextSlug || params.slug || "" },
        }
      : pathname;

    startTransition(() =>
      router.replace(href as never, { locale: nextLocale }),
    );
  };

  const nextLanguage = locale === "en" ? languages[1] : languages[0];
  const Flag = nextLanguage.flag;

  if (isPending) return <Loader2 size={20} className="animate-spin" />;

  return (
    <button
      type="button"
      onClick={onButtonClick}
      className="flex appearance-none items-center justify-center text-[20px]"
      aria-label="Change language"
    >
      <Flag />
    </button>
  );
};

export default LocaleSwitcher;
