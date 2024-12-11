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
  return (
    <>
      <Header />
      <div className="p-2 md:container md:mx-auto md:p-8">{children}</div>
      <Footer />
    </>
  );
}
