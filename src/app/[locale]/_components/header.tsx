import { Link } from "@/i18n/routing";
import { MapIcon, Search } from "lucide-react";
import AccountButton from "./account-button";
import LocaleSwitcher from "./language-switcher";
import { api } from "@/trpc/server";
import { getLocale } from "next-intl/server";

export async function Header() {
  const locale = await getLocale();
  const countries = await api.country.getCountries({ lang: locale });

  return (
    <header className="bg-brown text-stone-100">
      <div className="container mx-auto px-8 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl">
            Heritage builder
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
            <Link href={{ pathname: "/map" }} className="hover:text-stone-300">
              <MapIcon className="h-5 w-5" />
            </Link>
            <button aria-label="Search" className="hover:text-stone-300">
              <Search className="h-5 w-5" />
            </button>
            <AccountButton />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
