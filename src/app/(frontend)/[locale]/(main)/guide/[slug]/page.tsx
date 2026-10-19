import Breadcrumbs from "@/_components/breadcrumbs";
import GuideContactForms from "@/_components/guide-contact-forms";
import { Divider } from "@/components/icons";
import { Link } from "@/i18n/routing";
import { Locales, type LocaleType } from "@/lib/constans";
import { getMediaUrl } from "@/lib/media";
import {
  getBuildingsForGuide,
  getGuideBySlug,
  getGuides,
} from "@/lib/queries/guide";
import { createMetadata } from "@/lib/seo-utils";
import { BadgeCheck, Download } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { City, Guide } from "payload-types";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ slug: string; locale: LocaleType }>;
};

export const generateStaticParams = async () => {
  const params = [];
  for (const locale of Object.values(Locales)) {
    const guides = await getGuides(locale as LocaleType);
    params.push(...guides.map((guide) => ({ locale, slug: guide.slug })));
  }
  return params;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = await getGuideBySlug(locale, slug);
  if (!guide) return {};

  return createMetadata({
    title: guide.name,
    description: guide.bio,
    path:
      locale === "hu" ? `/idegenvezeto/${guide.slug}` : `/guide/${guide.slug}`,
    locale,
    image:
      typeof guide.profilePhoto === "object" ? guide.profilePhoto : undefined,
  });
}

const getMedia = (value: Guide["profilePhoto"] | Guide["publication"]) =>
  typeof value === "object" && value !== null ? value : null;

export default async function GuideProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  const guide = await getGuideBySlug(locale, slug);
  if (!guide) return notFound();

  const buildings = await getBuildingsForGuide(locale, guide.id);
  const profilePhoto = getMedia(guide.profilePhoto);
  const publication = getMedia(guide.publication);
  const t = await getTranslations("guide");
  const cities = Array.isArray(guide.cities)
    ? guide.cities.filter(
        (city): city is City => typeof city === "object" && city !== null,
      )
    : [];
  const languages = Array.isArray(guide.languages) ? guide.languages : [];
  const profilePhotoUrl =
    getMediaUrl(profilePhoto, "card") || getMediaUrl(profilePhoto);
  const publicationUrl = getMediaUrl(publication);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex w-fit flex-col">
        <Breadcrumbs items={[{ name: guide.name }]} />
        <Divider orientation="horizontal" />
      </div>

      <section className="bg-brown-50 grid gap-8 rounded-lg p-5 shadow-sm md:grid-cols-[220px_1fr] md:p-8">
        <div className="bg-brown-100 relative aspect-square overflow-hidden rounded-lg">
          {profilePhotoUrl && (
            <Image
              src={profilePhotoUrl}
              alt={guide.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 220px"
            />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-green flex items-center gap-2 text-sm font-semibold uppercase">
            <BadgeCheck className="h-5 w-5" aria-hidden="true" />
            {t("verified")}
          </div>
          <h1 className="text-brown font-playfair-display mt-2 text-4xl font-bold">
            {guide.name}
          </h1>
          <p className="text-brown-800 mt-4 text-lg">{guide.bio}</p>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-brown-700 font-semibold">{t("cities")}</p>
              <p className="text-brown-900 mt-1">
                {cities.map((city) => city.name).join(", ")}
              </p>
            </div>
            <div>
              <p className="text-brown-700 font-semibold">{t("languages")}</p>
              <p className="text-brown-900 mt-1">{languages.join(", ")}</p>
            </div>
            <div>
              <p className="text-brown-700 font-semibold">{t("phone")}</p>
              <a
                className="text-brown-900 mt-1 block hover:underline"
                href={`tel:${guide.phone}`}
              >
                {guide.phone}
              </a>
            </div>
            <div>
              <p className="text-brown-700 font-semibold">{t("email")}</p>
              <a
                className="text-brown-900 mt-1 block hover:underline"
                href={`mailto:${guide.email}`}
              >
                {guide.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-brown font-playfair-display text-3xl">
              {t("aboutTitle")}
            </h2>
            <p className="text-brown-900 mt-3 whitespace-pre-line">
              {guide.bio}
            </p>
          </section>

          <section>
            <h2 className="text-brown font-playfair-display text-3xl">
              {t("buildingsTitle")}
            </h2>
            {buildings.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {buildings.map((building) => (
                  <Link
                    key={building.id}
                    href={{
                      pathname: "/building/[slug]",
                      params: { slug: building.slug },
                    }}
                    className="bg-brown-50 text-brown-900 hover:bg-brown-100 rounded-md p-4 font-semibold shadow-sm transition-colors"
                  >
                    {building.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-brown-700 mt-3">{t("noBuildings")}</p>
            )}
          </section>

          {publicationUrl && (
            <section>
              <h2 className="text-brown font-playfair-display text-3xl">
                {t("publicationTitle")}
              </h2>
              <a
                href={publicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-green text-white-2 mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t("downloadPublication")}
              </a>
            </section>
          )}
        </div>

        <GuideContactForms guide={guide} buildings={buildings} />
      </div>
    </div>
  );
}
