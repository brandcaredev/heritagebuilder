"use client";
import { Link, useRouter } from "@/i18n/routing";
import { ChevronLeft } from "lucide-react";
import { type ComponentProps, Fragment } from "react";

type BreadcrumbItem = {
  href?: ComponentProps<typeof Link>["href"];
  name: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 md:gap-6">
      <ChevronLeft
        className="h-5 w-5 cursor-pointer text-brown-700"
        onClick={() => router.back()}
      />
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.href ? (
            <Link
              href={item.href}
              className="font-semibold text-brown-700 text-lg"
            >
              {item.name}
            </Link>
          ) : (
            <span className="font-semibold text-brown-700 text-lg">
              {item.name}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-brown-700 text-lg">/</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
