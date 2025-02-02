import { createClient } from "@/supabase/client";
import { type Provider } from "@supabase/supabase-js";
import { getURL } from "../utils";

export const supabase = createClient();

export async function signInWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${`${getURL()}/api/auth/callback`}`,
    },
  });
  return { data, error };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  return { data, error };
}
