import { type Metadata } from "next";
import { Footer } from "@/_components/footer";
import { Header } from "@/_components/header";
export const metadata: Metadata = {
  title: "Heritage Builder",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  console.log("LOCALE", locale);
  return (
    <>
      <Header />
      <div className="container mx-auto p-8">{children}</div>
      <Footer />
    </>
  );
}
