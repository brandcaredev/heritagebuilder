import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Handle i18n routing first
  const intlResponse = intlMiddleware(request);
  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /static (public files)
    // - sitemap.xml (sitemap)
    // - .*\\..*\\.* (files with extensions)
    "/((?!api|admin|robots.txt|sitemap.xml|_next|_vercel|static|.*\\..*\\.).*)",
    // Match all internationalized pathnames
    "/",
    "/(en|hu)/:path*",
  ],
};
