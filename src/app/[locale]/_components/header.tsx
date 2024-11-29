import { MapIcon, PlusCircleIcon, Search, User } from "lucide-react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  console.log("user", data.user);
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
            <Link href={{ pathname: "/map" }} className="hover:text-stone-300">
              <MapIcon className="h-5 w-5" />
            </Link>
            <button aria-label="Search" className="hover:text-stone-300">
              <Search className="h-5 w-5" />
            </button>
            <button aria-label="User account" className="hover:text-stone-300">
              <User className="h-5 w-5" />
            </button>
            <Link
              href={{ pathname: "/new" }}
              aria-label="New building"
              className="hover:text-stone-300"
            >
              <PlusCircleIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
