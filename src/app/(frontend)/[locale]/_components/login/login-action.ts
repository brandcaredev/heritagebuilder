"use server";
import { createClient } from "@/supabase/server";
import { loginSchema } from "./login-schema";

export async function signInWithEmail(data: FormData) {
  const formData = Object.fromEntries(data);
  const { success, data: parsedData } = loginSchema.safeParse(formData);

  if (!success) {
    return {
      message: "Invalid data",
      isSuccess: false,
    };
  }
  const supabase = await createClient();

  const {
    error,
    data: { user },
  } = await supabase.auth.signInWithPassword(parsedData);

  if (error) {
    console.error(error);
    return {
      message: "Login failed!",
      isSuccess: false,
    };
  }
  return {
    message: "Logged in successfully!",
    user: user,
    isSuccess: true,
  };
}
