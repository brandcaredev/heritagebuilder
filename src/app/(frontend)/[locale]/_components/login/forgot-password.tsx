"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { requestPasswordReset } from "./forgot-password-action";
import { forgotPasswordSchema } from "./forgot-password-schema";
import { CastleIcon } from "@/components/icons/castle-icon";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword({
  backToLogin,
}: {
  backToLogin: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordValues) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", data.email);
      const { isSuccess } = await requestPasswordReset(formData, locale);

      if (!isSuccess) {
        toast.error(t("toast.loginError"));
        return;
      }

      toast.success(t("auth.resetEmailSent"));
      setSent(true);
    } catch {
      toast.error(t("toast.loginError"));
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex flex-col space-y-4 text-center">
            <CastleIcon className="mx-auto h-16 w-16" />
            <p className="text-brown text-3xl font-bold">
              {t("auth.resetPassword")}
            </p>
          </DialogTitle>
        </DialogHeader>
        <p className="text-brown-900 text-center">{t("auth.resetEmailSent")}</p>
        <Button
          variant="outline"
          onClick={backToLogin}
          className="w-full"
        >
          {t("auth.backToLogin")}
        </Button>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex flex-col space-y-4 text-center">
          <CastleIcon className="mx-auto h-16 w-16" />
          <p className="text-brown text-3xl font-bold">
            {t("auth.resetPassword")}
          </p>
          <p className="text-muted-foreground px-8 text-center text-xs font-medium">
            {t("auth.sendResetLink").toUpperCase()}
          </p>
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-green-dark-60">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                placeholder={t("auth.emailPlaceholder")}
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="bg-white-2 text-brown-900 placeholder:text-brown-200"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <Button disabled={isLoading} className="rounded-xl">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.sendResetLink")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={backToLogin}
              className="w-full"
              disabled={isLoading}
            >
              {t("auth.backToLogin")}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
