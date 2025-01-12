"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithProvider } from "@/lib/supabase/auth";
import { getQueryClient } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { loginSchema } from "./login-schema";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { signInWithEmail } from "./login-action";

type LoginValues = z.infer<typeof loginSchema>;

export default function Login({
  switchDialog,
  closeDialog,
}: {
  switchDialog: () => void;
  closeDialog: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("email", data.email);
      const { message, isSuccess, user } = await signInWithEmail(formData);

      if (!isSuccess) {
        toast.error(message);
        return;
      }

      toast.success(message);
      const queryClient = getQueryClient();
      await queryClient.setQueryData(["user"], { user });
      closeDialog();
      router.refresh();
    } catch (error) {
      toast.error(t("toast.loginError"));
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithProvider("google");

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error(t("toast.loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {" "}
      <DialogHeader>
        <DialogTitle className="flex flex-col space-y-4 text-center">
          <h1 className="text-3xl font-bold text-brown">{t("auth.signIn")}</h1>
          <p className="text-muted-foreground px-8 text-center text-sm">
            {t("auth.logInUsingEmailAddress").toUpperCase()}
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
                className="bg-white-2 text-brown-4 placeholder:text-brown-2"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-green-dark-60">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect="off"
                disabled={isLoading}
                className="bg-white-2 text-brown-4 placeholder:text-brown-2"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("auth.signIn")}
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              {t("auth.or")}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="border-none bg-[#3B76D6] text-white hover:bg-[#3B76D6]/80 hover:text-white"
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          {t("auth.continueWithGoogle")}
        </Button>
      </div>
      <p className="text-muted-foreground px-8 text-center text-sm">
        {t("auth.notAMemberYet")}{" "}
        <div
          onClick={switchDialog}
          className="font-semibold text-green underline underline-offset-4 hover:text-green-2"
        >
          {t("auth.createAccount")}
        </div>
      </p>
    </>
  );
}
