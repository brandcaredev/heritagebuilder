"use server";
import { createClient } from "@/supabase/server";
import { signUpSchema } from "./signup-schema";
import { getURL } from "@/lib/utils";

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

  const { error } = await supabase.auth.signUp({
    email: parsedData.email,
    password: parsedData.password,
    options: {
      emailRedirectTo: getURL(),
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
