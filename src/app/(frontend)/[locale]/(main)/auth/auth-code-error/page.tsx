import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { LocaleType } from "@/lib/constans";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export default async function AuthCodeErrorPage(props: Props) {
  await props.params;
  const t = await getTranslations();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-16 text-center">
      <h1 className="text-brown text-3xl font-bold">
        {t("auth.authLinkInvalidTitle")}
      </h1>
      <p className="text-brown-900">{t("auth.authLinkInvalidDescription")}</p>
      <Button asChild variant="outline" className="mt-4 w-full">
        <Link href="/">{t("page.goToHome")}</Link>
      </Button>
    </div>
  );
}

