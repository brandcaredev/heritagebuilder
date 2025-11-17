import React from "react";
import { getAboutUsContent } from "@/lib/queries/about-us";
import type { LocaleType } from "@/lib/constans";
import { getTranslations } from "next-intl/server";
import RichText from "./richtext";
import { Button } from "@/components/ui";
import { createClient } from "@/supabase/server";
import Link from "next/link";

interface AboutUsProps {
  locale: LocaleType;
}

const AboutUs: React.FC<AboutUsProps> = async ({ locale }) => {
  const t = await getTranslations();
  const aboutUsContent = await getAboutUsContent(locale);
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (!aboutUsContent) {
    return null;
  }
  return (
    <div className="mb-16">
      <h2 className="text-brown text-3xl font-bold">
        {t("page.welcomeTitle")}
      </h2>
      <div className="lg:px-30">
        <RichText
          className="text-brown-700 mt-6"
          data={aboutUsContent}
          enableGutter={false}
        />
      </div>
      {data.user && (
        <div className="mt-8 flex w-full items-center justify-center">
          <Button asChild>
            <Link
              href={{ pathname: "/new" }}
              aria-label={t("account.newBuilding")}
            >
              {t("common.submitNewBuilding")}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AboutUs;
