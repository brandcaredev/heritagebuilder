"use client";
import { Button, Input } from "@/components/ui";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export default function Newsletter() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const { mutateAsync: addToNewsletter, isPending } =
    api.user.addToNewsletter.useMutation({
      onSuccess: () => {
        setEmail("");
        toast.success(t("newsletter.success"));
      },
    });
  return (
    <div className="flex flex-1 flex-col gap-4 md:items-center md:justify-between">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white-2">
          {t("newsletter.title")}
        </h2>
        <p className="text-white-2/80">{t("newsletter.description")}</p>
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="email"
          placeholder={t("newsletter.emailPlaceholder")}
          className="rounded-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
        <Button
          disabled={isPending}
          onClick={async () => await addToNewsletter(email)}
        >
          {t("newsletter.subscribe")}
        </Button>
      </div>
    </div>
  );
}
