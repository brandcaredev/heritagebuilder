import { Divider } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/routing";
import type { LocaleType } from "@/lib/constans";
import { getBuildings } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountriesBasic } from "@/lib/queries/country";
import { getURL } from "@/lib/utils";
import config from "@payload-config";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getPayload } from "payload";
import type { City, Country, Media } from "payload-types";
import { Suspense } from "react";
import AboutUs from "@/_components/about-us";
import AllBuildingsMap from "@/_components/all-buildings-map";
import Newsletter from "@/_components/newsletter";
import VideoCarousel from "@/_components/video-carousel";

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

const payload = await getPayload({ config });

export const generateMetadata = async (
  _: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> => {
  const t = await getTranslations();
  const title = (await parent).title || "Heritage Builder";
  return {
    title,
    description: t("description"),
  };
};

const MainPage = async (props: Props) => {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations();

  const countries = await getCountriesBasic(locale);
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
  const buildings = await getBuildings(locale, 10, "-createdAt");

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
                    src={`${getURL()}${(country.image as Media).url}`}
                    alt={`${country.name}country image`}
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

          {/* About Us Section */}
          <AboutUs locale={locale} />
        </div>

        <div className="hidden lg:block">
          <Divider />
        </div>

        {/* Latest Buildings Sidebar */}
        <div className="lg:w-2/6">
          <h2 className="mb-6 text-4xl font-bold text-brown">
            {t("page.latestBuildings")}
          </h2>
          {/* TODO: SADLY THIS NEEDS TO SCALE WHEN ADDING NEW COUNTRIES */}
          <ScrollArea className="mt-0 lg:h-[750px] 2xl:h-[800px]">
            {buildings.map((building) => {
              return (
                <Link
                  key={building.id}
                  href={{
                    pathname: "/building/[slug]",
                    params: { slug: building.slug },
                  }}
                  className="group relative mb-4 flex items-center gap-4"
                >
                  <div className="relative aspect-square h-[50px] w-[50px]">
                    <Image
                      src={`${getURL()}${(building.featuredImage as Media).thumbnailURL}`}
                      alt={`${building.name}building image`}
                      fill
                      className="rounded object-cover"
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
          </ScrollArea>
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
                src={`${getURL()}${(type.image as Media).url}`}
                alt={`${type.name}building type image`}
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
      {/* Map */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AllBuildingsMap locale={locale} />
      </Suspense>
      {/* Newsletter Section */}
      <div className="flex items-center gap-8 rounded-lg bg-brown-700 p-8">
        <Newsletter />
      </div>
      {/* Videos Section */}
      {youtubeLinks.length > 0 && <VideoCarousel videos={youtubeLinks} />}
    </div>
  );
};
export default MainPage;
