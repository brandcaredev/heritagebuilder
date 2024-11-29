import { type Metadata } from "next";
import { Footer } from "@/_components/footer";
import { Header } from "@/_components/header";
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
