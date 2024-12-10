import { Link } from "@/i18n/routing";
import { MapIcon, Search } from "lucide-react";
import AccountButton from "./account-button";
import LocaleSwitcher from "./language-switcher";

export async function Header() {
  return (
    <header className="bg-brown text-stone-100">
      <div className="container mx-auto px-8 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl">
            Heritage builder
          </Link>
          <nav className="hidden space-x-8 md:flex">
            <Link
              href={{
                pathname: "/country/[slug]",
                params: { slug: "romania" },
              }}
              className="hover:text-stone-300"
            >
              Romania
            </Link>
            <Link
              href={{ pathname: "/country/[slug]", params: { slug: "serbia" } }}
              className="hover:text-stone-300"
            >
              Serbia
            </Link>
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
