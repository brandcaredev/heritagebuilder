import Image from "next/image";

import { Link } from "@/i18n/routing";
import Divider from "@/components/icons/divider";
import { getTranslations } from "next-intl/server";
import VideoCarousel from "../_components/video-carousel";
import Newsletter from "../_components/newsletter";
import { getPayload } from "payload";
import config from "@payload-config";
import { City, Country, Media } from "payload-types";
import { LocaleType } from "@/lib/constans";
import { getCountries } from "@/lib/queries/country";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getBuildings } from "@/lib/queries/building";

const payload = await getPayload({ config });

export default async function MainPage(props: {
  params: Promise<{ locale: LocaleType }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations();

  const countries = await getCountries(locale);
  const buildingTypes = await getBuildingTypes(locale);
  const { docs: youtubeLinks } = await payload.find({
    collection: "youtube-links",
    locale: locale,
    where: {
      language: {
        equals: locale,
      },
    },
  });
  const buildings = await getBuildings(locale, 6);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Main Content */}
        <div className="lg:w-4/6">
          <h1 className="mb-8 text-4xl font-extrabold text-brown">
            {t("page.discover")}
          </h1>

          {/* Country Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {countries.map(async (country) => {
              return (
                <Link
                  key={country.id}
                  href={{
                    pathname: "/country/[slug]",
                    params: { slug: country.slug },
                  }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <Image
                    src={(country.image as Media).url ?? "/placeholder.svg"}
                    alt={country.name ?? t("page.countryImageAlt")}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h2 className="absolute bottom-4 left-4 text-3xl text-white">
                    {country.name}
                  </h2>
                </Link>
              );
            })}
          </div>

          {/*Description*/}
          <div>
            <h2 className="text-2xl font-bold text-brown">
              {t("page.welcomeTitle")}
            </h2>
            <p className="px-8 pt-2">{t("description")}</p>
          </div>
        </div>

        <div className="hidden lg:block">
          <Divider />
        </div>

        {/* TODO: Slice based on size */}
        {/* Latest Buildings Sidebar */}
        <div className="lg:w-2/6">
          <h2 className="mb-6 text-4xl font-bold text-brown">
            {t("page.latestBuildings")}
          </h2>
          <div className="space-y-4 text-brown-900">
            {buildings.map((building) => {
              return (
                <Link
                  key={building.id}
                  href={{
                    pathname: "/building/[slug]",
                    params: { slug: building.slug },
                  }}
                  className="group relative flex items-center gap-4"
                >
                  <div className="aspect-square">
                    <Image
                      src={(building.featuredImage as Media).thumbnailURL ?? ""}
                      alt={building.name ?? t("building.imageAlt")}
                      width={50}
                      height={50}
                      className="h-full w-full rounded object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-brown group-hover:text-opacity-80">
                      {building.name}
                    </h3>
                    <p className="text-brown-dark-20 font-source-sans-3 text-xs uppercase">
                      {`${building.city ? (building.city as City).name : ""} ${building.city && building.country ? ", " : ""} ${building.country ? (building.country as Country).name : ""}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Building Types Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {buildingTypes.map((type) => {
          return (
            <Link
              key={type.id}
              href={{
                pathname: "/building-type/[slug]",
                params: { slug: type.slug },
              }}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={(type.image as Media).url ?? "/placeholder.svg"}
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
      {/* Newsletter Section */}
      <div className="flex items-center gap-8 rounded-lg bg-brown-700 p-8">
        <div className="hidden md:block md:w-1/3">
          <Image
            src="/newsletter-image.jpg"
            alt={t("page.newsletterImageAlt")}
            width={300}
            height={200}
            className="h-full w-full rounded-lg object-cover"
          />
        </div>
        <Newsletter />
      </div>
      {/* Videos Section */}
      {youtubeLinks.length > 0 && <VideoCarousel videos={youtubeLinks} />}
    </div>
  );
}
