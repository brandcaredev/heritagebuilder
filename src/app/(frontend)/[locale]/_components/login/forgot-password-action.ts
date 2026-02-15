"use server";

import { Locales } from "@/lib/constans";
import { getURL } from "@/lib/utils";
import { createClient } from "@/supabase/server";
import { forgotPasswordSchema } from "./forgot-password-schema";

function getSafeLocale(locale: string) {
  return Object.keys(Locales).includes(locale) ? locale : "hu";
}

export async function requestPasswordReset(data: FormData, locale: string) {
  const formData = Object.fromEntries(data);
  const { success, data: parsedData } = forgotPasswordSchema.safeParse(formData);

  if (!success) {
    return {
      message: "Invalid email",
      isSuccess: false,
    };
  }

  const safeLocale = getSafeLocale(locale);
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsedData.email,
    {
      redirectTo: `${getURL()}/api/auth/confirm?next=/${safeLocale}/reset-password`,
    },
  );

  if (error) {
    console.error(error);
  }

  // Avoid leaking whether the email exists
  return {
    message: "If an account exists for that email, we've sent a reset link.",
    isSuccess: true,
  };
}

