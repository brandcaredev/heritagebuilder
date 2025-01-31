"use client";
import { Link, useRouter } from "@/i18n/routing";
import { ChevronLeft } from "lucide-react";
import { ComponentProps, Fragment } from "react";

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
              className="text-lg font-semibold text-brown-700"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-lg font-semibold text-brown-700">
              {item.name}
            </span>
          )}
          {index < items.length - 1 && (
            <span className="text-lg text-brown-700">/</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
