import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Footer() {
  return (
    <footer className="bg-green py-12 text-stone-100">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h2 className="mb-4 text-2xl">Heritage builder</h2>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 cursor-pointer hover:text-stone-300" />
              <Facebook className="h-5 w-5 cursor-pointer hover:text-stone-300" />
              <Youtube className="h-5 w-5 cursor-pointer hover:text-stone-300" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-stone-300" />
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Countries</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={{
                    pathname: "/country/[slug]",
                    params: { slug: "romania" },
                  }}
                  className="hover:text-stone-300"
                >
                  Romania
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/country/[slug]",
                    params: { slug: "serbia" },
                  }}
                  className="hover:text-stone-300"
                >
                  Serbia
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/country/[slug]",
                    params: { slug: "slovakia" },
                  }}
                  className="hover:text-stone-300"
                >
                  Slovakia
                </Link>
              </li>
              <li>
                <Link
                  href={{
                    pathname: "/country/[slug]",
                    params: { slug: "ukraine" },
                  }}
                  className="hover:text-stone-300"
                >
                  Ukraine
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Building Types</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/buildings/temples"
                  className="hover:text-stone-300"
                >
                  Temples
                </Link>
              </li>
              <li>
                <Link
                  href="/buildings/castles"
                  className="hover:text-stone-300"
                >
                  Castles
                </Link>
              </li>
              <li>
                <Link
                  href="/buildings/fortresses"
                  className="hover:text-stone-300"
                >
                  Fortresses
                </Link>
              </li>
              <li>
                <Link
                  href="/buildings/common-buildings"
                  className="hover:text-stone-300"
                >
                  Common Buildings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-stone-300">
                  Terms Of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-stone-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-stone-300">
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-stone-300">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
