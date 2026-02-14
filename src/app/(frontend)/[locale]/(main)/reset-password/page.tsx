import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { LocaleType } from "@/lib/constans";
import { createClient } from "@/supabase/server";
import { getTranslations } from "next-intl/server";
import ResetPasswordForm from "./reset-password-form";

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export default async function ResetPasswordPage(props: Props) {
  await props.params;
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-brown text-3xl font-bold">
          {t("auth.resetPassword")}
        </h1>
      </div>

      {user ? (
        <div className="rounded-2xl bg-brown-200 p-6">
          <ResetPasswordForm />
        </div>
      ) : (
        <div className="rounded-2xl bg-brown-200 p-6 text-center">
          <p className="text-brown-900">{t("auth.resetLinkInvalid")}</p>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/">
              {t("page.goToHome")}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
