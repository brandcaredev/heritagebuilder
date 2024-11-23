import { type ReactNode } from "react";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { Toaster } from "sonner";

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
