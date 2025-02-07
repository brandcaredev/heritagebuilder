"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";
import { resend, signUpWithEmail } from "./signup-action";
import { signUpSchema } from "./signup-schema";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type SignUpValues = z.infer<typeof signUpSchema>;

export default function Register({
  switchDialog,
}: {
  switchDialog: () => void;
}) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmActive, setConfirmActive] = useState(false);
  const [resendActive, setResendActive] = useState(false);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setResendActive(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [confirmActive, timeLeft]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpValues) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("email", data.email);
      formData.append("confirmPassword", data.confirmPassword);
      const { message, isSuccess } = await signUpWithEmail(formData);

      if (!isSuccess) {
        toast.error(message);
        return;
      }

      setEmail(data.email);
      setConfirmActive(true);
    } catch (error) {
      toast.error(t("toast.registerError"));
    } finally {
      setIsLoading(false);
    }
  }
  if (confirmActive) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold text-brown">
              {t("auth.signUpSuccess")}
            </h1>
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-brown-900">{t("auth.checkEmail")}</p>
        <p className="text-center text-xl font-bold text-brown-900">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => switchDialog()}
            className="w-full"
          >
            {t("auth.backToLogin")}
          </Button>
          <Button
            onClick={async () => {
              const { message, isSuccess } = await resend(email);
              if (isSuccess) {
                toast.success(message);
                setResendActive(false);
                setTimeLeft(300);
              } else {
                toast.error(message);
              }
            }}
            className="w-full"
            disabled={!resendActive}
          >
            {t("auth.resendCode")}
          </Button>
        </DialogFooter>
      </>
    );
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold text-brown">
            {t("auth.register")}
          </h1>
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
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-green-dark-60">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                className="bg-white-2 text-brown-900 placeholder:text-brown-200"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-green-dark-60">
                {t("auth.confirmPassword")}
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
            <Button disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.register")}
            </Button>
          </div>
        </form>
      </div>
      <p className="text-muted-foreground px-8 text-center text-sm">
        {t("auth.alreadyHaveAccount")}{" "}
        <div
          onClick={switchDialog}
          className="font-semibold text-green underline underline-offset-4 hover:text-green-2"
        >
          {t("auth.signIn")}
        </div>
      </p>
    </>
  );
}
