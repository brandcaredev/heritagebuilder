"use client";
import { usePathname, useRouter } from "@/i18n/routing";
import { LocaleType } from "@/lib/constans";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { ChangeEvent, useTransition } from "react";

const languages = [
  { label: "English", value: "en", flag: "🇬🇧" },
  { label: "Magyar", value: "hu", flag: "🇭🇺" },
];

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [_isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as LocaleType;
    startTransition(() =>
      router.replace(
        //@ts-expect-error
        { pathname, params },
        { locale: nextLocale },
      ),
    );
  }
  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={onSelectChange}
        className="flex appearance-none items-center rounded border border-gray-300 bg-transparent px-3 py-1 pr-8 text-sm leading-tight focus:border-blue-500 focus:outline-none"
      >
        {languages.map((language) => (
          <option
            key={language.value}
            value={language.value}
            className="flex items-center"
          >
            {language.flag} {language.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
