import "@/styles/globals.css";
import "@/styles/embla.css";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import IconLight from "@/public/hb-white.png";
import IconDark from "@/public/hb.png";

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
      media: "(prefers-color-scheme: light)",
      url: IconDark.src,
      type: "image/svg+xml",
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: IconLight.src,
      type: "image/svg+xml",
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
            </NextIntlClientProvider>
          </TRPCReactProvider>
          <Toaster richColors />
        </div>
      </body>
    </html>
  );
}
