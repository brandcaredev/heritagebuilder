import { Footer } from "@/_components/footer";
import { Header } from "@/_components/header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="p-2 md:container sm:min-h-[calc(100vh-56px)] md:mx-auto md:p-8">
        {children}
      </div>
    </>
  );
}
