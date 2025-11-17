import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { routing } from "@/i18n/routing";
import IconLight from "@/public/hb-white.png";
import IconDark from "@/public/hb.png";
import "@/styles/embla.css";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";
import { type Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3",
});

export const metadata: Metadata = {
  title: "Heritage Builder",
  icons: [
    {
      rel: "icon",
      url: IconDark.src,
      type: "image/png",
    },
    {
      rel: "icon",
      media: "(prefers-color-scheme: dark)",
      url: IconLight.src,
      type: "image/png",
    },
  ],
};

export default async function FrontendLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>,
) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <div className={`${playfairDisplay.variable} ${sourceSans3.variable}`}>
          <TRPCReactProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <main>{children}</main>
              <CookieConsentBanner />
            </NextIntlClientProvider>
          </TRPCReactProvider>
          <Toaster richColors />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
