/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "~/i18n/routing";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { Playfair_Display, Source_Sans_3 } from "@next/font/google";
export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3",
});

export const metadata: Metadata = {
  title: "Heritage Builder",
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${sourceSans3.variable}`}
    >
      <body>
        <TRPCReactProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
