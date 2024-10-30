import { Search, User } from "lucide-react";
import { Link } from "~/i18n/routing";

export function Header() {
  return (
    <header className="bg-brown text-stone-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl">
            Heritage builder
          </Link>
          <nav className="hidden space-x-8 md:flex">
            <Link href="/romania" className="hover:text-stone-300">
              Romania
            </Link>
            <Link href="/serbia" className="hover:text-stone-300">
              Serbia
            </Link>
            <Link href="/slovakia" className="hover:text-stone-300">
              Slovakia
            </Link>
            <Link href="/ukraine" className="hover:text-stone-300">
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
          </div>
        </div>
      </div>
    </header>
  );
}
