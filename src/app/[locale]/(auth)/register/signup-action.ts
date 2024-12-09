"use server";
import { createClient } from "@/supabase/server";
import { signUpSchema } from "./signup-schema";
import { headers } from "next/headers";

export async function signUpWithEmail(data: FormData) {
  const formData = Object.fromEntries(data);
  const { success, data: parsedData } = signUpSchema.safeParse(formData);

  if (!success) {
    return {
      message: "Invalid data",
      isSuccess: false,
    };
  }
  const supabase = await createClient();

  const headersList = headers();
  const host = headersList.get("X-Forwarded-Host");
  const proto = headersList.get("X-Forwarded-Proto");

  const { error } = await supabase.auth.signUp({
    email: parsedData.email,
    password: parsedData.password,
    options: {
      emailRedirectTo: `${proto}://${host}/`,
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
