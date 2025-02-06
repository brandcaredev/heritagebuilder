import { Link } from "@/i18n/routing";
import { LocaleType } from "@/lib/constans";
import { getCountries } from "@/lib/queries/country";
import HBRow from "@/public/hb-row.png";
import { MapIcon } from "lucide-react";
import { getLocale } from "next-intl/server";
import Image from "next/image";
import { Suspense } from "react";
import AccountButton from "./account-button";
import LocaleSwitcher from "./language-switcher";
import ExpandableSearch from "./search";

export async function Header() {
  const locale = (await getLocale()) as LocaleType;
  const countries = await getCountries(locale);

  return (
    <header className="bg-brown text-stone-100">
      <div className="mx-auto px-2 py-2 md:container md:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image src={HBRow} alt="Heritage Builder" width={77} />
          </Link>
          <nav className="hidden space-x-8 md:flex">
            {countries.map((country) => (
              <Link
                key={country.id}
                href={{
                  pathname: "/country/[slug]",
                  params: { slug: country.slug },
                }}
                className="hover:text-stone-300"
              >
                {country.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Link href={{ pathname: "/map" }} className="hover:text-stone-300" aria-label="Map">
              <MapIcon className="h-5 w-5" />
            </Link>
            <Suspense>
              <ExpandableSearch />
            </Suspense>
            <AccountButton />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
