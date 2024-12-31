"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { signInWithProvider } from "@/lib/supabase/auth";
import { getQueryClient } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { signInWithEmail } from "./login-action";
import { loginSchema } from "./login-schema";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
      router.push("/");
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
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brown">
            Heritagebuilder
          </h1>
        </div>

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
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
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
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            {t("auth.createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
