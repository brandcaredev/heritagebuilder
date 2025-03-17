import { Header } from "@/_components/header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div>{children}</div>
    </>
  );
}
