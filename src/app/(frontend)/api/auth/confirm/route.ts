import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

function getSafeNext(next: string | null) {
  if (!next) return "/";
  // Only allow relative redirects within this app
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function normalizeEmailOtpType(type: string | null): EmailOtpType | null {
  if (!type) return null;

  // Some email templates mistakenly use `type=email` for signup confirmations
  if (type === "email") return "signup";

  switch (type) {
    case "signup":
    case "magiclink":
    case "recovery":
    case "invite":
    case "email_change":
      return type;
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = normalizeEmailOtpType(searchParams.get("type"));
  const next = getSafeNext(searchParams.get("next"));
  const supabase = await createClient();

  // OAuth callback uses `code` (PKCE) and must be exchanged for a session.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    console.error("exchangeCodeForSession ERROR", error);
  }

  // Email links (signup/recovery/magiclink/etc.) use `token_hash` + `type`
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) redirect(next);
    console.error("verifyOtp ERROR", error);
  }

  // TODO CREATE AUTH PAGE
  // redirect the user to an error page with some instructions
  redirect("/auth/auth-code-error");
}
