import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);
const PUBLIC_FILE = /\.(.*)$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_FILE.test(pathname) ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Next.js can invoke Proxy again for the internal destination of a rewrite.
  // next-intl marks that request with this header; reprocessing its internal
  // pathname would redirect it back to the same localized URL indefinitely.
  const isIntlRewrite = request.headers.has("x-next-intl-locale");
  const intlResponse = isIntlRewrite
    ? NextResponse.next({ request })
    : intlMiddleware(request);
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
    // - favicon.ico (favicon)
    // - .*\\..* (files with extensions)
    "/((?!api|admin|robots.txt|sitemap.xml|favicon.ico|_next|_vercel|static|.*\\..*).*)",
  ],
};
