import { ReactNode, Suspense } from "react";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
