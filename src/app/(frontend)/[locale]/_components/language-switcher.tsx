"use client";
import EnFlag from "@/components/icons/en-flag";
import HunFlag from "@/components/icons/hun-flag";
import { usePathname } from "@/i18n/routing";
import { LocaleType } from "@/lib/constans";
import { api } from "@/trpc/react";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";

const languages = [
  { label: "EN", value: "en", flag: EnFlag },
  { label: "HU", value: "hu", flag: HunFlag },
] as const;

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

  const onButtonClick = async () => {
    const nextLocale = locale === "en" ? "hu" : "en";
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

  const nextLanguage = locale === "en" ? languages[1] : languages[0];
  const Flag = nextLanguage.flag;

  return (
    <button
      onClick={onButtonClick}
      className="flex appearance-none items-center justify-center text-[20px]"
    >
      <Flag />
    </button>
  );
}
