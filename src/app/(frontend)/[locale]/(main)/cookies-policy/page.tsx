import type { LocaleType } from "@/lib/constans";
import EnglishCookiePolicy from "./content/en";
import HungarianCookiePolicy from "./content/hu";
export const dynamic = "force-static";

const CookiePolicyPage = async (props: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await props.params;

  return (
    <div>
      {locale === "hu" ? <HungarianCookiePolicy /> : <EnglishCookiePolicy />}
    </div>
  );
};
export default CookiePolicyPage;
