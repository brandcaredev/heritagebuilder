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
    <div className="flex items-center gap-6">
      <ChevronLeft
        className="text-brown-700 h-5 w-5 cursor-pointer"
        onClick={() => router.back()}
      />
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.href ? (
            <Link
              href={item.href}
              className="text-brown-700 text-lg font-semibold"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-brown-700 text-lg font-semibold">
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
