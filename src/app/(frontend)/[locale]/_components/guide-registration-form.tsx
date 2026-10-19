"use client";

import { Button, Input, Textarea } from "@/components/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Locales, type LocaleType } from "@/lib/constans";
import { isValidGuidePhoneNumber } from "@/lib/guide-phone-validation";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, FileText, Plus, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { City, Country } from "payload-types";

const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PUBLICATION_SIZE = 8 * 1024 * 1024;

class LocalizedFormError extends Error {}

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isPdf = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export default function GuideRegistrationForm({
  cities,
  countries,
  locale,
}: {
  cities: Pick<City, "id" | "name" | "country">[];
  countries: Pick<Country, "id" | "name">[];
  locale: LocaleType;
}) {
  const t = useTranslations("guide");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityIds, setSelectedCityIds] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageDraft, setLanguageDraft] = useState("");
  const [activeBioLanguage, setActiveBioLanguage] = useState<LocaleType>(locale);
  const [bioTranslations, setBioTranslations] = useState<
    Record<LocaleType, string>
  >({ en: "", hu: "" });
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [publicationFile, setPublicationFile] = useState<File | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const publicationInputRef = useRef<HTMLInputElement>(null);

  const cityCountryIds = new Set(
    cities
      .map((city) => {
        const country = city.country;
        return typeof country === "object" && country !== null
          ? country.id
          : country;
      })
      .map(String),
  );
  const selectableCountries = countries.filter((country) =>
    cityCountryIds.has(String(country.id)),
  );
  const availableCities = cities.filter((city) => {
    const countryId =
      typeof city.country === "object" && city.country !== null
        ? city.country.id
        : city.country;
    return String(countryId) === selectedCountryId;
  });
  const selectedCityNames = availableCities
    .filter((city) => selectedCityIds.includes(city.id))
    .map((city) => city.name)
    .filter((name): name is string => Boolean(name));

  const toggleCity = (cityId: number) => {
    setSelectedCityIds((selected) =>
      selected.includes(cityId)
        ? selected.filter((id) => id !== cityId)
        : [...selected, cityId],
    );
  };

  const addLanguage = () => {
    const language = languageDraft.trim().replace(/\s+/g, " ");
    if (!language) return;

    setSelectedLanguages((selected) =>
      selected.some(
        (item) => item.toLocaleLowerCase() === language.toLocaleLowerCase(),
      )
        ? selected
        : [...selected, language],
    );
    setLanguageDraft("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get("name") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const phone = String(formData.get("phone") ?? "").trim();
      const bioEnglish = String(formData.get("bioEnglish") ?? "").trim();
      const bioHungarian = String(formData.get("bioHungarian") ?? "").trim();
      const profilePhoto = formData.get("profilePhoto");
      const publication = formData.get("publication");

      if (!name) {
        throw new LocalizedFormError(t("registration.nameRequired"));
      }

      if (!email || !isValidEmail(email)) {
        throw new LocalizedFormError(t("registration.emailInvalid"));
      }

      if (!phone) {
        throw new LocalizedFormError(t("registration.phoneRequired"));
      }

      if (!isValidGuidePhoneNumber(phone)) {
        throw new LocalizedFormError(t("registration.phoneInvalid"));
      }

      if (!bioEnglish || !bioHungarian) {
        throw new LocalizedFormError(t("registration.bioRequired"));
      }

      if (!selectedCountryId) {
        throw new LocalizedFormError(t("registration.countryRequired"));
      }

      if (!selectedCityIds.length) {
        throw new LocalizedFormError(t("registration.cityRequired"));
      }

      if (!selectedLanguages.length) {
        throw new LocalizedFormError(t("registration.languagesRequired"));
      }

      if (
        !(profilePhoto instanceof File) ||
        profilePhoto.name === "" ||
        profilePhoto.size === 0
      ) {
        throw new LocalizedFormError(t("registration.profilePhotoRequired"));
      }

      if (
        !profilePhoto.type.startsWith("image/") ||
        profilePhoto.size > MAX_PROFILE_PHOTO_SIZE
      ) {
        throw new LocalizedFormError(t("registration.profilePhotoInvalid"));
      }

      if (publication instanceof File && publication.name !== "") {
        if (
          publication.size === 0 ||
          publication.size > MAX_PUBLICATION_SIZE ||
          !isPdf(publication)
        ) {
          throw new LocalizedFormError(t("registration.publicationInvalid"));
        }
      }

      const response = await fetch("/api/guides/register", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        const apiErrorMessages: Record<string, string> = {
          requiredFields: t("registration.requiredFields"),
          emailInvalid: t("registration.emailInvalid"),
          phoneInvalid: t("registration.phoneInvalid"),
          profilePhotoInvalid: t("registration.profilePhotoInvalid"),
          publicationUploadInvalid: t("registration.publicationInvalid"),
          publicationInvalid: t("registration.publicationInvalid"),
          countryUnavailable: t("registration.countryUnavailable"),
          citiesUnavailable: t("registration.citiesUnavailable"),
        };
        throw new LocalizedFormError(
          (result.error && apiErrorMessages[result.error]) ||
            t("registration.error"),
        );
      }

      setSubmitted(true);
      form.reset();
      setProfilePhotoFile(null);
      setPublicationFile(null);
      setSelectedLanguages([]);
      setLanguageDraft("");
      setBioTranslations({ en: "", hu: "" });
    } catch (submissionError) {
      setError(
        submissionError instanceof LocalizedFormError
          ? submissionError.message
          : t("registration.error"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-brown-50 rounded-lg p-8 text-center shadow-sm">
        <h2 className="text-brown font-playfair-display text-3xl">
          {t("registration.successTitle")}
        </h2>
        <p className="text-brown-800 mt-4">{t("registration.success")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-brown-50 rounded-lg p-5 shadow-sm md:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-brown-900 text-sm font-semibold">
            {t("name")}
          </span>
          <Input name="name" required autoComplete="name" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-brown-900 text-sm font-semibold">
            {t("email")}
          </span>
          <Input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-brown-900 text-sm font-semibold">
            {t("phone")}
          </span>
          <Input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            onChange={() => setError(null)}
          />
        </label>
        <div className="flex flex-col gap-2">
          <span
            id="guide-country-label"
            className="text-brown-900 text-sm font-semibold"
          >
            {t("registration.country")}
          </span>
          <Select
            value={selectedCountryId}
            onValueChange={(countryId) => {
              setSelectedCountryId(countryId);
              setSelectedCityIds([]);
              setCityPickerOpen(false);
            }}
          >
            <SelectTrigger
              aria-labelledby="guide-country-label"
              className="h-10 shadow-none"
            >
              <SelectValue placeholder={t("registration.selectCountry")} />
            </SelectTrigger>
            <SelectContent>
              {selectableCountries.map((country) => (
                <SelectItem key={country.id} value={String(country.id)}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="countryId" value={selectedCountryId} />
        </div>
        <div className="flex flex-col gap-2">
          <span
            id="guide-cities-label"
            className="text-brown-900 text-sm font-semibold"
          >
            {t("cities")}
          </span>
          <Popover open={cityPickerOpen} onOpenChange={setCityPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                role="combobox"
                aria-labelledby="guide-cities-label"
                aria-expanded={cityPickerOpen}
                disabled={!selectedCountryId || availableCities.length === 0}
                className="border-brown-200 bg-brown-100 text-brown-900 hover:bg-brown-100 hover:text-brown-900 h-auto min-h-10 w-full justify-between rounded-md border px-3 py-2 text-left font-normal"
              >
                <span className="truncate">
                  {selectedCityNames.length
                    ? selectedCityNames.join(", ")
                    : !selectedCountryId
                      ? t("registration.chooseCountryFirst")
                      : availableCities.length
                        ? t("registration.selectCities")
                        : t("registration.noCities")}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] p-0"
            >
              <Command>
                <CommandInput placeholder={t("registration.searchCities")} />
                <CommandList>
                  <CommandEmpty>
                    {t("registration.noMatchingCities")}
                  </CommandEmpty>
                  <CommandGroup>
                    {availableCities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={`${city.name} ${city.id}`}
                        onSelect={() => toggleCity(city.id)}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selectedCityIds.includes(city.id)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {city.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedCityIds.map((cityId) => (
            <input key={cityId} type="hidden" name="cities" value={cityId} />
          ))}
          <input type="hidden" name="cityLocale" value={locale} />
        </div>
        <fieldset className="flex flex-col gap-2 md:col-span-2">
          <legend className="text-brown-900 text-sm font-semibold">
            {t("languages")}
          </legend>
          <p className="text-brown-700 text-sm">
            {t("registration.selectLanguages")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="guide-language-draft">
              {t("registration.languageInputLabel")}
            </label>
            <Input
              id="guide-language-draft"
              value={languageDraft}
              maxLength={80}
              placeholder={t("registration.languagePlaceholder")}
              onChange={(event) => setLanguageDraft(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addLanguage();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addLanguage}
              disabled={!languageDraft.trim()}
              className="shrink-0 gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("registration.addLanguage")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedLanguages.map((language) => (
              <span
                key={language}
                className="border-brown-200 bg-brown-100 text-brown-900 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
              >
                {language}
                <button
                  type="button"
                  aria-label={t("registration.removeLanguage", { language })}
                  onClick={() =>
                    setSelectedLanguages((selected) =>
                      selected.filter((item) => item !== language),
                    )
                  }
                  className="text-brown-700 hover:text-brown-900 rounded-sm"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <input type="hidden" name="languages" value={language} />
              </span>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-3 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="guide-bio"
              className="text-brown-900 text-sm font-semibold"
            >
              {t("bio")} ({tCommon(activeBioLanguage)})
            </label>
            <Tabs
              value={activeBioLanguage}
              onValueChange={(value) =>
                setActiveBioLanguage(value as LocaleType)
              }
            >
              <TabsList>
                {Object.values(Locales).map((language) => (
                  <TabsTrigger key={language} value={language}>
                    {tCommon(language)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <p className="text-brown-700 text-sm">
            {t("registration.bioLanguageHint")}
          </p>
          <Textarea
            id="guide-bio"
            value={bioTranslations[activeBioLanguage]}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setBioTranslations((current) => ({
                ...current,
                [activeBioLanguage]: value,
              }));
            }}
            aria-required="true"
            className="min-h-36"
          />
          <input type="hidden" name="bioEnglish" value={bioTranslations.en} />
          <input
            type="hidden"
            name="bioHungarian"
            value={bioTranslations.hu}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span
            id="guide-profile-photo-label"
            className="text-brown-900 text-sm font-semibold"
          >
            {t("profilePhoto")}
          </span>
          <Input
            ref={profilePhotoInputRef}
            name="profilePhoto"
            type="file"
            accept="image/*"
            aria-labelledby="guide-profile-photo-label"
            aria-describedby="guide-profile-photo-hint"
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only"
            onChange={(event) => {
              setProfilePhotoFile(event.currentTarget.files?.[0] ?? null);
              setError(null);
            }}
          />
          {profilePhotoFile ? (
            <div className="border-brown-200 bg-brown-100 flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <FileText
                className="text-brown-700 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span
                className="text-brown-900 min-w-0 flex-1 truncate"
                title={profilePhotoFile.name}
              >
                {profilePhotoFile.name}
              </span>
              <button
                type="button"
                aria-label={`${t("registration.replaceFile")} ${t("profilePhoto")}`}
                className="text-brown-700 hover:text-brown-900 focus-visible:ring-green shrink-0 text-xs underline underline-offset-4 focus-visible:rounded focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                {t("registration.replaceFile")}
              </button>
              <button
                type="button"
                aria-label={`${t("registration.removeFile")} ${t("profilePhoto")}`}
                title={`${t("registration.removeFile")} ${t("profilePhoto")}`}
                className="text-brown-700 hover:text-brown-900 focus-visible:ring-green flex h-7 w-7 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => {
                  if (profilePhotoInputRef.current) {
                    profilePhotoInputRef.current.value = "";
                  }
                  setProfilePhotoFile(null);
                }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-describedby="guide-profile-photo-hint"
              className="border-brown-200 bg-brown-100 text-brown-900 hover:bg-brown-50 focus-visible:ring-green flex min-h-10 w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => profilePhotoInputRef.current?.click()}
            >
              <Upload className="text-brown-700 h-4 w-4" aria-hidden="true" />
              {t("registration.chooseFile")}
            </button>
          )}
          <span
            id="guide-profile-photo-hint"
            className="text-brown-700 text-xs"
          >
            {t("registration.profilePhotoHint")}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span
            id="guide-publication-label"
            className="text-brown-900 text-sm font-semibold"
          >
            {t("publication")}
          </span>
          <Input
            ref={publicationInputRef}
            name="publication"
            type="file"
            accept="application/pdf,.pdf"
            aria-labelledby="guide-publication-label"
            aria-describedby="guide-publication-hint"
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only"
            onChange={(event) => {
              setPublicationFile(event.currentTarget.files?.[0] ?? null);
              setError(null);
            }}
          />
          {publicationFile ? (
            <div className="border-brown-200 bg-brown-100 flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <FileText
                className="text-brown-700 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span
                className="text-brown-900 min-w-0 flex-1 truncate"
                title={publicationFile.name}
              >
                {publicationFile.name}
              </span>
              <button
                type="button"
                aria-label={`${t("registration.replaceFile")} ${t("publication")}`}
                className="text-brown-700 hover:text-brown-900 focus-visible:ring-green shrink-0 text-xs underline underline-offset-4 focus-visible:rounded focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => publicationInputRef.current?.click()}
              >
                {t("registration.replaceFile")}
              </button>
              <button
                type="button"
                aria-label={`${t("registration.removeFile")} ${t("publication")}`}
                title={`${t("registration.removeFile")} ${t("publication")}`}
                className="text-brown-700 hover:text-brown-900 focus-visible:ring-green flex h-7 w-7 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => {
                  if (publicationInputRef.current) {
                    publicationInputRef.current.value = "";
                  }
                  setPublicationFile(null);
                  setError(null);
                }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-describedby="guide-publication-hint"
              className="border-brown-200 bg-brown-100 text-brown-900 hover:bg-brown-50 focus-visible:ring-green flex min-h-10 w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => publicationInputRef.current?.click()}
            >
              <Upload className="text-brown-700 h-4 w-4" aria-hidden="true" />
              {t("registration.chooseFile")}
            </button>
          )}
          <span id="guide-publication-hint" className="text-brown-700 text-xs">
            {t("registration.publicationHint")}
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-6">
        {isSubmitting ? t("registration.submitting") : t("registration.submit")}
      </Button>
    </form>
  );
}
