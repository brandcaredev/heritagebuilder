"use server";

import { createClient } from "@/supabase/server";
import { resetPasswordSchema } from "./reset-password-schema";

export async function updatePassword(data: FormData) {
  const formData = Object.fromEntries(data);
  const { success, data: parsedData } = resetPasswordSchema.safeParse(formData);

  if (!success) {
    return {
      message: "Invalid password",
      isSuccess: false,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      message: "Not authenticated",
      isSuccess: false,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsedData.password,
  });

  if (error) {
    console.error(error);
    return {
      message: "Update failed",
      isSuccess: false,
    };
  }

  return {
    message: "Password updated",
    isSuccess: true,
  };
}

