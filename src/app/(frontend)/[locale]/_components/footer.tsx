import { Link } from "@/i18n/routing";
import type { LocaleType } from "@/lib/constans";
import { getBuildingTypes } from "@/lib/queries/building-type";
import { getCountries } from "@/lib/queries/country";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export async function Footer() {
  const locale = await getLocale();
  const countries = await getCountries(locale as LocaleType);
  const buildingTypes = await getBuildingTypes(locale as LocaleType);
  const t = await getTranslations();

  return (
    <footer className="bg-green py-12 text-stone-100">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-start">
          <div className="flex-1">
            <h2 className="mb-4 text-2xl">Heritage builder</h2>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 cursor-pointer hover:text-stone-300" />
              <Facebook className="h-5 w-5 cursor-pointer hover:text-stone-300" />
              <Youtube className="h-5 w-5 cursor-pointer hover:text-stone-300" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-stone-300" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-5 sm:mt-0">
            <div>
              <h3 className="mb-2 font-bold">{t("footer.countries")}</h3>
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
              <h3 className="mb-2 font-bold">{t("footer.buildingTypes")}</h3>
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
              <h3 className="mb-2 font-bold">{t("footer.legal")}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={{ pathname: "/terms-of-service" }}
                    className="hover:text-stone-300"
                  >
                    {t("footer.termsOfService")}
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href={{ pathname: "/privacy-policy" }}
                    className="hover:text-stone-300"
                  >
                    Privacy Policy
                  </Link>
                </li> */}
                <li>
                  <Link
                    href={{ pathname: "/cookies-policy" }}
                    className="hover:text-stone-300"
                  >
                    {t("footer.cookiesPolicy") || "Cookies Policy"}
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href={{ pathname: "/about-us" }}
                    className="hover:text-stone-300"
                  >
                    About Us
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
