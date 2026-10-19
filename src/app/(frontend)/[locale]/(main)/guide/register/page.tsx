import GuideRegistrationForm from "@/_components/guide-registration-form";
import Breadcrumbs from "@/_components/breadcrumbs";
import { Divider } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  getGuideCityOptions,
  getGuideCountryOptions,
} from "@/lib/queries/guide";
import type { LocaleType } from "@/lib/constans";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guide");
  return { title: t("registration.title") };
}

export default async function GuideRegistrationPage({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) {
  const { locale } = await params;
  const [cities, countries, t] = await Promise.all([
    getGuideCityOptions(locale),
    getGuideCountryOptions(locale),
    getTranslations("guide"),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex w-fit flex-col">
        <Breadcrumbs items={[{ name: t("registration.title") }]} />
        <Divider orientation="horizontal" />
      </div>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-brown font-playfair-display text-4xl font-bold">
          {t("registration.title")}
        </h1>
        <p className="text-brown-800 mt-3 mb-8 max-w-2xl">
          {t("registration.description")}
        </p>
        <GuideRegistrationForm
          cities={cities}
          countries={countries}
          locale={locale}
        />
      </div>
    </div>
  );
}
