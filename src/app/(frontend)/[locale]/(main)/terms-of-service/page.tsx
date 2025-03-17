import type { LocaleType } from "@/lib/constans";
import EnglishTerms from "./content/en";
import HungarianTerms from "./content/hu";
export const dynamic = "force-static";

const TermsPage = async (props: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await props.params;

  return <div>{locale === "hu" ? <HungarianTerms /> : <EnglishTerms />}</div>;
};
export default TermsPage;
