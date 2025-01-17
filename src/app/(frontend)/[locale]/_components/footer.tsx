import { Link } from "@/i18n/routing";
import { getBuildingTypes, getCountries } from "@/lib/queries";
import config from "@payload-config";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { getLocale } from "next-intl/server";
import { getPayload } from "payload";

export async function Footer() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const countries = await getCountries();
  const buildingTypes = await getBuildingTypes();

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
              {countries.map((country) => (
                <li key={country.id}>
                  <Link
                    href={{
                      pathname: "/country/[slug]",
                      params: { slug: country.slug },
                    }}
                    className="hover:text-stone-300"
                  >
                    {country.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Building Types</h3>
            <ul className="space-y-2">
              {buildingTypes.map((type) => (
                <li key={type.id}>
                  <Link
                    href={{
                      pathname: "/building-type/[slug]",
                      params: { slug: type.slug },
                    }}
                    className="hover:text-stone-300"
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={{ pathname: "/terms-of-service" }}
                  className="hover:text-stone-300"
                >
                  Terms Of Service
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: "/privacy-policy" }}
                  className="hover:text-stone-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: "/cookies-policy" }}
                  className="hover:text-stone-300"
                >
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: "/about-us" }}
                  className="hover:text-stone-300"
                >
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
