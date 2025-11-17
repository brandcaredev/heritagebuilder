import Breadcrumbs from "@/_components/breadcrumbs";
import BuildingList from "@/_components/building-list";
import SimplePage from "@/_components/simple-page";
import { Divider } from "@/components/icons";
import { Button } from "@/components/ui";
import { Locales, LocaleType } from "@/lib/constans";
import { getBuildingsByFilter } from "@/lib/queries/building";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountiesByFilter, getCountyBySlug } from "@/lib/queries/county";
import { createMetadata, generateMetaDescription } from "@/lib/seo-utils";
import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Country } from "payload-types";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string; locale: LocaleType }>;
};

export const generateStaticParams = async () => {
  const params = [];

  for (const locale of Object.values(Locales)) {
    const { counties } = await getCountiesByFilter(locale as LocaleType, {});
    const countyParams = counties.map((county) => ({
      locale,
      slug: county.slug,
    }));
    params.push(...countyParams);
  }

  return params;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale, slug } = await params;
  const county = await getCountyBySlug(locale, slug);
  if (!county) return {};
  const path =
    locale === "hu" ? `/megye/${county.slug}` : `/county/${county.slug}`;
  const description = generateMetaDescription(county.description);

  return createMetadata({
    title: county.name,
    description,
    path,
    locale,
  });
};

const CountyPage = async (props: Props) => {
  const params = await props.params;
  const { slug, locale } = params;
  const searchParams = await props.searchParams;
  const t = await getTranslations();

  if (!slug) return notFound();

  const county = await getCountyBySlug(locale, slug);
  const buildingTypes = await getBuildingTypes(locale);
  if (!county) return notFound();

  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  const { buildings, totalPages } = await getBuildingsByFilter(
    locale,
    {
      county: {
        equals: county.id,
      },
      ...(searchParams?.buildingType && {
        "buildingType.slug": {
          equals: searchParams.buildingType as string,
        },
      }),
      ...(searchParams?.q && {
        or: [
          {
            name: {
              like: searchParams.q,
            },
          },
          {
            summary: {
              like: searchParams.q,
            },
          },
        ],
      }),
    },
    12,
    page,
  );
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const countyCountry = county.country as Country | null;
  const breadcrumbItems = [
    ...(countyCountry
      ? ([
          {
            name: countyCountry.name,
            href: {
              pathname: "/country/[slug]",
              params: { slug: countyCountry.slug },
            },
          },
        ] as const)
      : []),
    { name: county.name },
  ];
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex w-full justify-between">
        <div className="flex w-fit flex-col">
          <Breadcrumbs items={breadcrumbItems} />
          <Divider orientation="horizontal" />
        </div>
        {data?.user && (
          <div>
            <Button asChild>
              <Link
                href={{ pathname: "/new" }}
                aria-label={t("account.newBuilding")}
              >
                {t("common.submitNewBuilding")}
              </Link>
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <SimplePage
          name={county.name}
          description={county.description}
          buildings={buildings}
          position={county.position}
        />
        <BuildingList
          buildings={buildings}
          buildingTypes={buildingTypes}
          buildingTypeFilter={searchParams?.buildingType as string}
          totalPages={totalPages}
          page={page}
        />
      </div>
    </div>
  );
};

export default CountyPage;
