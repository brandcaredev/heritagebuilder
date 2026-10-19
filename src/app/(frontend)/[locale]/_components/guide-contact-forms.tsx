"use client";

import { Button, Input, Textarea } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import type { Building, Guide } from "payload-types";
import { useState } from "react";

type GuideBuilding = Pick<Building, "id" | "name" | "slug">;

export default function GuideContactForms({
  guide,
  buildings,
}: {
  guide: Guide;
  buildings: GuideBuilding[];
}) {
  const t = useTranslations("guide");
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const submitContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setContactStatus(null);
    setIsContactSubmitting(true);

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/guides/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: guide.id,
          name: formData.get("contactName"),
          email: formData.get("contactEmail"),
          message: formData.get("contactMessage"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || t("form.error"));
      setContactStatus(t("form.contactSuccess"));
      form.reset();
    } catch (error) {
      setContactStatus(
        error instanceof Error ? error.message : t("form.error"),
      );
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBookingStatus(null);
    setIsBookingSubmitting(true);

    try {
      const formData = new FormData(form);
      const response = await fetch("/api/guides/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideId: guide.id,
          name: formData.get("bookingName"),
          email: formData.get("bookingEmail"),
          requestedDate: formData.get("requestedDate"),
          people: formData.get("people"),
          buildingIds: formData.getAll("buildingIds"),
          language: formData.get("language"),
          additionalMessage: formData.get("additionalMessage"),
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || t("form.error"));
      setBookingStatus(t("form.bookingSuccess"));
      form.reset();
    } catch (error) {
      setBookingStatus(
        error instanceof Error ? error.message : t("form.error"),
      );
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-brown-200 bg-brown-50 shadow-sm">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="font-playfair-display text-brown text-2xl">
            {t("form.contactTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <form onSubmit={submitContact} className="flex flex-col gap-4">
            <Input name="contactName" placeholder={t("form.name")} required />
            <Input
              name="contactEmail"
              type="email"
              placeholder={t("form.email")}
              required
            />
            <Textarea
              name="contactMessage"
              placeholder={t("form.message")}
              required
              className="min-h-32"
            />
            {contactStatus && (
              <p role="status" className="text-brown-800 text-sm">
                {contactStatus}
              </p>
            )}
            <Button type="submit" disabled={isContactSubmitting}>
              {isContactSubmitting ? t("form.sending") : t("form.send")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-brown-200 bg-brown-50 shadow-sm">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="font-playfair-display text-brown text-2xl">
            {t("form.bookingTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <form onSubmit={submitBooking} className="flex flex-col gap-4">
            <Input name="bookingName" placeholder={t("form.name")} required />
            <Input
              name="bookingEmail"
              type="email"
              placeholder={t("form.email")}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="requestedDate"
                type="date"
                aria-label={t("form.requestedDate")}
                min={new Date().toISOString().slice(0, 10)}
                required
              />
              <Input
                name="people"
                type="number"
                min={1}
                placeholder={t("form.people")}
                aria-label={t("form.people")}
                required
              />
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-brown-900 text-sm font-semibold">
                {t("form.buildings")}
              </legend>
              {buildings.length ? (
                buildings.map((building) => (
                  <label
                    key={building.id}
                    className="text-brown-800 flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="buildingIds"
                      value={building.id}
                      className="accent-green h-4 w-4"
                    />
                    {building.name}
                  </label>
                ))
              ) : (
                <p className="text-brown-700 text-sm">
                  {t("form.noBuildings")}
                </p>
              )}
            </fieldset>
            <Input name="language" placeholder={t("form.language")} required />
            <Textarea
              name="additionalMessage"
              placeholder={t("form.additionalMessage")}
              className="min-h-28"
            />
            {bookingStatus && (
              <p role="status" className="text-brown-800 text-sm">
                {bookingStatus}
              </p>
            )}
            <Button
              type="submit"
              disabled={isBookingSubmitting || !buildings.length}
            >
              {isBookingSubmitting ? t("form.sending") : t("form.requestTour")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
