"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { updatePassword } from "./reset-password-action";
import { resetPasswordSchema } from "./reset-password-schema";

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);

      const { isSuccess } = await updatePassword(formData);
      if (!isSuccess) {
        toast.error(t("toast.loginError"));
        return;
      }

      toast.success(t("auth.passwordUpdated"));
      router.push("/");
      router.refresh();
    } catch {
      toast.error(t("toast.loginError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="password" className="text-green-dark-60">
          {t("auth.newPassword")}
        </Label>
        <Input
          id="password"
          type="password"
          disabled={isLoading}
          className="bg-white-2 text-brown-900 placeholder:text-brown-200"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword" className="text-green-dark-60">
          {t("auth.confirmNewPassword")}
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          disabled={isLoading}
          className="bg-white-2 text-brown-900 placeholder:text-brown-200"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button disabled={isLoading} className="rounded-xl">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("auth.resetPassword")}
      </Button>
    </form>
  );
}
