"use server";
import { createClient } from "@/supabase/server";
import { signUpSchema } from "./signup-schema";
import { getURL } from "@/lib/utils";
import { Locales } from "@/lib/constans";

function getSafeLocale(locale: string) {
  return Object.keys(Locales).includes(locale) ? locale : "hu";
}

export async function signUpWithEmail(data: FormData, locale: string) {
  const formData = Object.fromEntries(data);
  const { success, data: parsedData } = signUpSchema.safeParse(formData);

  if (!success) {
    return {
      message: "Invalid data",
      isSuccess: false,
    };
  }
  const supabase = await createClient();
  const safeLocale = getSafeLocale(locale);

  const { error } = await supabase.auth.signUp({
    email: parsedData.email,
    password: parsedData.password,
    options: {
      emailRedirectTo: `${getURL()}/api/auth/confirm?next=/${safeLocale}`,
    },
  });

  if (error) {
    console.error(error);
    return {
      message: "Signup failed!",
      isSuccess: false,
    };
  }
  return {
    message: "Signed up successfully!",
    isSuccess: true,
  };
}

export async function resend(email: string, locale: string) {
  if (!email)
    return {
      message: "Resend failed!",
      isSuccess: false,
    };
  const supabase = await createClient();
  const safeLocale = getSafeLocale(locale);
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${getURL()}/api/auth/confirm?next=/${safeLocale}`,
    },
  });

  if (error) {
    console.error(error);
    return {
      message: "Resend failed!",
      isSuccess: false,
    };
  }
  return {
    message: "Resent successfully!",
    isSuccess: true,
  };
}
