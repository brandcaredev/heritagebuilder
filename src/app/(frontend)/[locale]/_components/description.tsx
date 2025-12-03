import React from "react";
import type { LocaleType } from "@/lib/constans";
import { getTranslations } from "next-intl/server";
import RichText from "./richtext";
import { Button } from "@/components/ui";
import { createClient } from "@/supabase/server";
import Link from "next/link";
import { getDescriptionContent } from "@/lib/queries/description";

interface DescriptionProps {
  locale: LocaleType;
}

const Description: React.FC<DescriptionProps> = async ({ locale }) => {
  const t = await getTranslations();
  const descriptionContent = await getDescriptionContent(locale);
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (!descriptionContent) {
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
          data={descriptionContent}
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

export default Description;
