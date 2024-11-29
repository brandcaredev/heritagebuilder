import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const nonTranslatedPage = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Handle i18n routing first
  const intlResponse = intlMiddleware(request);

  if (nonTranslatedPage.includes(request.nextUrl.pathname)) {
    return await updateSession(request, response);
  }

  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /static (public files)
    // - .*\\..*\\.* (files with extensions)
    "/((?!api|_next|_vercel|static|.*\\..*\\.).*)",
    // Match all internationalized pathnames
    "/",
    "/(en|hu)/:path*",
  ],
};
