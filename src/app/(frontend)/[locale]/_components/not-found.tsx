"use client";

import { Divider, Icons } from "@/components/icons";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export const NotFoundComponent = () => {
  const t = useTranslations();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col items-center justify-center gap-10">
        <Icons.notFound width={100} height={100} />
        <h1 className="text-2xl font-bold text-brown sm:text-4xl">
          {t("page.notFound")}
        </h1>
        <Divider full orientation="horizontal" />
      </div>
      <div className="flex flex-col">
        <p>{t("page.notFoundDescription")}</p>
        <p>{t("page.notFoundDescription2")}</p>
        <Link href="/" className="pl-4 text-sm text-green underline">
          {t("page.goToHome")}
        </Link>
      </div>
    </div>
  );
};
