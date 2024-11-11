import { PlusCircle, PlusCircleIcon, Search, User } from "lucide-react";
import { Link } from "~/i18n/routing";

export function Header() {
  return (
    <header className="bg-brown text-stone-100">
      <div className="container mx-auto px-4 py-4">
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
            <Link
              href={{
                pathname: "/country/[slug]",
                params: { slug: "slovakia" },
              }}
              className="hover:text-stone-300"
            >
              Slovakia
            </Link>
            <Link
              href={{
                pathname: "/country/[slug]",
                params: { slug: "ukraine" },
              }}
              className="hover:text-stone-300"
            >
              Ukraine
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button aria-label="Search" className="hover:text-stone-300">
              <Search className="h-5 w-5" />
            </button>
            <button aria-label="User account" className="hover:text-stone-300">
              <User className="h-5 w-5" />
            </button>
            <button aria-label="New building" className="hover:text-stone-300">
              <PlusCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
