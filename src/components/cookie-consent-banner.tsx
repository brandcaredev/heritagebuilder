"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasConsent = localStorage.getItem("cookie-consent");

    if (!hasConsent) {
      // Show banner if no consent is stored
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    // Store consent in local storage
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brown-100 p-4 shadow-lg">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center text-brown-900 md:text-left">
          <p>{t("cookies.consentMessage")}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={{ pathname: "/cookies-policy" }}
            className="text-center text-brown-900 underline hover:text-brown-700"
          >
            {t("cookies.policy")}
          </Link>
          <Button
            onClick={acceptCookies}
            className="min-w-28 bg-green text-white hover:bg-green/80"
          >
            {t("cookies.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
};
