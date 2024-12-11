"use server";
import { createClient } from "@/supabase/server";
import { signUpSchema } from "./signup-schema";

const getURL = () => {
  // TODO URLS
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.startsWith("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};

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
