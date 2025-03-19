import React from "react";
import { getAboutUsContent } from "@/lib/queries/about-us";
import type { LocaleType } from "@/lib/constans";
import { getTranslations } from "next-intl/server";
import RichText from "./richtext";

interface AboutUsProps {
  locale: LocaleType;
}

const AboutUs: React.FC<AboutUsProps> = async ({ locale }) => {
  const t = await getTranslations();
  const aboutUsContent = await getAboutUsContent(locale);
  if (!aboutUsContent) {
    return null;
  }
  return (
    <div>
      <h2 className="text-2xl font-bold text-brown">
        {t("page.welcomeTitle")}
      </h2>
      <RichText
        className="mt-6 text-brown-700"
        data={aboutUsContent}
        enableGutter={false}
      />
    </div>
  );
};

export default AboutUs;
