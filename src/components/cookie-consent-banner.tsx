"use client";

import { useSyncExternalStore } from "react";
import { Button } from "./ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const COOKIE_CONSENT_KEY = "cookie-consent";
const consentListeners = new Set<() => void>();

const readConsent = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
};

const subscribeToConsent = (listener: () => void) => {
  if (typeof window === "undefined") {
    return () => void 0;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_KEY) {
      listener();
    }
  };

  consentListeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    consentListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

const notifyConsentListeners = () => {
  for (const listener of consentListeners) {
    listener();
  }
};

export const CookieConsentBanner = () => {
  const hasConsent = useSyncExternalStore(
    subscribeToConsent,
    readConsent,
    () => false,
  );
  const t = useTranslations();

  const acceptCookies = () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    notifyConsentListeners();
  };

  if (hasConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brown-100 p-4 shadow-lg">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center font-bold text-brown-900 md:text-left">
          {t("cookies.consentMessage")}
        </p>
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
