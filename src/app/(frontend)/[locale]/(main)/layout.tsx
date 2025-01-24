import { type Metadata } from "next";
import { Footer } from "@/_components/footer";
import { Header } from "@/_components/header";
export const metadata: Metadata = {
  title: "Heritage Builder",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="p-2 md:container sm:min-h-[calc(100vh-312px-48px)] md:mx-auto md:p-8">
        {children}
      </div>
      <Footer />
    </>
  );
}
