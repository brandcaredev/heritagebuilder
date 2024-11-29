import { type Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Footer } from "@/_components/footer";
import { Header } from "@/_components/header";
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="container mx-auto p-8">{children}</div>
      <Footer />
    </>
  );
}
