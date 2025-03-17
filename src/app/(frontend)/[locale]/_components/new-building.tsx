"use client";
import { FileUploader } from "@/components/file-uploader";
import { Icons, Divider } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/routing";
import { Locales, type LocaleType } from "@/lib/constans";
import { slugify } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { BuildingType, Country } from "payload-types";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import Breadcrumbs from "./breadcrumbs";
import { Loader2 } from "lucide-react";

const MapPositionSelector = dynamic(
  () => import("@/components/map-position-selector"),
  { ssr: false },
);

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    return file;
  }
};

const fileSchema = z.instanceof(File);

const translatedContentSchema = z.object({
  summary: z.string().min(1, "This field is required"),
  name: z.string().min(1, "This field is required"),
  history: z.string().min(1, "This field is required"),
  style: z.string().min(1, "This field is required"),
  presentDay: z.string().min(1, "This field is required"),
  famousResidents: z.string().optional(),
  renovation: z.string().optional(),
});

const optionalSchema = z.object({
  summary: z.string().optional(),
  name: z.string().optional(),
  history: z.string().optional(),
  style: z.string().optional(),
  presentDay: z.string().optional(),
  famousResidents: z.string().optional(),
  renovation: z.string().optional(),
});

export const formSchema = z.object({
  country: z.string(),
  type: z.string(),
  en: optionalSchema.optional().superRefine((values, ctx) => {
    // if `en` is not even provided, skip
    if (!values) {
      return;
    }

    const {
      name,
      history,
      style,
      presentDay,
      summary,
      famousResidents,
      renovation,
    } = values;

    const hasAnyEnContent = !!(
      summary?.trim() ||
      name?.trim() ||
      history?.trim() ||
      style?.trim() ||
      famousResidents?.trim() ||
      renovation?.trim() ||
      presentDay?.trim()
    );

    if (hasAnyEnContent) {
      // If there's content in at least one field, we want ALL to be filled
      if (!name?.trim()) {
        ctx.addIssue({
          path: ["name"],
          code: "custom",
          message: "Name is required if any English field is filled",
        });
      }
      if (!history?.trim()) {
        ctx.addIssue({
          path: ["history"],
          code: "custom",
          message: "History is required if any English field is filled",
        });
      }
      if (!style?.trim()) {
        ctx.addIssue({
          path: ["style"],
          code: "custom",
          message: "Style is required if any English field is filled",
        });
      }
      if (!presentDay?.trim()) {
        ctx.addIssue({
          path: ["presentDay"],
          code: "custom",
          message: "Present day is required if any English field is filled",
        });
      }
      if (!summary?.trim()) {
        ctx.addIssue({
          path: ["summary"],
          code: "custom",
          message: "Summary is required if any English field is filled",
        });
      }
    }
  }),
  hu: translatedContentSchema,
  featuredImage: z.array(fileSchema),
  images: z.array(fileSchema),
  position: z.tuple([z.number(), z.number()]),
  creatorname: z.string().optional(),
  creatoremail: z.string().optional(),
  source: z.string().optional(),
});

export default function BuildingForm({
  buildingTypes,
  countries,
}: {
  buildingTypes: BuildingType[];
  countries: Pick<Country, "countryCode" | "id">[];
}) {
  const t = useTranslations();
  const [activeLanguage, setActiveLanguage] = useState<LocaleType>("hu");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    values,
  ) => {
    const country = countries.find((c) => c.countryCode === values.country);
    if (!country) {
      toast.error(t("toast.countryError"), {
        id: "building-creation-toast",
      });
      return;
    }
    const featuredImage = values.featuredImage[0];
    if (!featuredImage) {
      toast.error(t("toast.featuredImageError"), {
        id: "building-creation-toast",
      });
      return;
    }
    try {
      toast.loading(t("toast.creatingBuilding"), {
        id: "building-creation-toast",
      });

      // Compress featured image if larger than 1MB
      const featuredImageToUpload =
        featuredImage.size > 1024 * 1024
          ? await compressImage(featuredImage)
          : featuredImage;

      const imageFormData = new FormData();
      imageFormData.append(
        "file",
        featuredImageToUpload,
        `${slugify(values.hu.name)}-featured`,
      );
      const reqFeaturedImage = await fetch(`/api/buildings-media`, {
        credentials: "include",
        method: "POST",
        body: imageFormData,
      }).then((res) => res.json());
      const featuredImageID = reqFeaturedImage.doc.id;
      // Upload and compress additional images if needed

      const imageIDs = await Promise.all(
        values.images.map(async (image, index) => {
          const imageFormData = new FormData();
          const imageToUpload =
            image.size > 1024 * 1024 ? await compressImage(image) : image;
          imageFormData.append(
            `file`,
            imageToUpload,
            `${slugify(values.hu.name)}-${index + 1}`,
          );

          const req = await fetch(`/api/buildings-media`, {
            credentials: "include",
            method: "POST",
            body: imageFormData,
          }).then((res) => res.json());

          return req.doc.id;
        }),
      );

      const hunPayload = {
        name: values.hu.name,
        summary: values.hu.summary,
        slug: slugify(values.hu.name),
        history: values.hu.history,
        style: values.hu.style,
        presentDay: values.hu.presentDay,
        famousResidents: values.hu.famousResidents || "",
        renovation: values.hu.renovation || "",
        buildingType: parseInt(values.type),
        country: country.id,
        position: [values.position[0], values.position[1]],
        creatorName: values.creatorname || "",
        creatorEmail: values.creatoremail || "",
        images: imageIDs,
        featuredImage: featuredImageID,
        source: values.source || "",
      };

      const hunResponse = await fetch(`/api/buildings?locale=hu`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hunPayload),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to submit the building");
        return res.json();
      });

      const hasEnglishData =
        values.en &&
        Object.entries(values.en).some(
          ([_, value]) => value && value.trim() !== "",
        );

      if (hasEnglishData && values.en) {
        const enPayload = {
          name: values.en.name,
          summary: values.en.summary,
          slug: slugify(values.en.name!),
          history: values.en.history,
          style: values.en.style,
          presentDay: values.en.presentDay,
          famousResidents: values.en.famousResidents || "",
          renovation: values.en.renovation || "",
        };
        await fetch(`/api/buildings/${hunResponse.doc.id}?locale=en`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(enPayload),
        }).then((res) => {
          if (!res.ok)
            throw new Error(
              "Failed to submit the english part of the building",
            );
          return res.json();
        });
      }
      toast.success(t("toast.buildingCreated"), {
        id: "building-creation-toast",
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(t("toast.buildingError"), {
        id: "building-creation-toast",
      });
    }
  };
  const SuccessDialog = () => {
    const router = useRouter();

    return (
      <Dialog
        open={showSuccessDialog}
        onOpenChange={() => {
          setShowSuccessDialog(false);
          router.replace("/");
        }}
      >
        <DialogContent className="z-10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex justify-center text-2xl font-semibold text-brown">
              {t("successDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6 text-center">
            <div className="text-brown-700">
              <Icons.castle width={64} height={64} />
            </div>
            <p className="text-gray-600">{t("successDialog.uploadSuccess")}</p>
            <p className="text-gray-600">{t("successDialog.description")}</p>
            <div className="flex space-x-4"></div>
          </div>
          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                router.replace("/");
              }}
            >
              {t("common.goToHome")}
            </Button>

            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                form.reset();
                router.refresh();
              }}
            >
              {t("common.createAnother")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  return (
    <div>
      <div className="flex w-fit flex-col">
        <Breadcrumbs
          items={[
            {
              name: t("common.submitNewBuilding"),
            },
          ]}
        />
        <Divider orientation="horizontal" />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-10 flex flex-col gap-10 lg:flex-row"
        >
          <div className="lg:max-h-screen lg:w-1/2">
            <FileUploader form={form} />
          </div>
          <Tabs
            value={activeLanguage}
            onValueChange={(v) => setActiveLanguage(v as LocaleType)}
            className="flex flex-col space-y-5 lg:w-1/2"
          >
            <TabsList>
              {Object.values(Locales).map((locale) => (
                <TabsTrigger key={locale} value={locale}>
                  {t(`common.${locale}`)}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.values(Locales).map((lang) => (
              <TabsContent className="space-y-5" key={lang} value={lang}>
                <FormField
                  control={form.control}
                  name={`${lang}.name`}
                  defaultValue=""
                  rules={{ deps: ["en", "hu"] }}
                  render={({ field }) => {
                    const enStyle = form.watch("en.style");
                    const enPresentDay = form.watch("en.presentDay");
                    const enFamousResidents = form.watch("en.famousResidents");
                    const enRenovation = form.watch("en.renovation");
                    const enSummary = form.watch("en.summary");
                    const isRequired =
                      lang === Locales.hu ||
                      (lang === Locales.en &&
                        !!(
                          enStyle ||
                          enPresentDay ||
                          enFamousResidents ||
                          enRenovation ||
                          enSummary ||
                          field.value
                        ));

                    return (
                      <FormItem>
                        <FormLabel required={isRequired}>
                          {t("form.name")}
                        </FormLabel>
                        <FormDescription>
                          {t("form.descriptions.name")}
                        </FormDescription>
                        <FormControl>
                          <Input placeholder="" type="text" {...field} />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name={`${lang}.summary`}
                  defaultValue=""
                  rules={{ deps: ["en", "hu"] }}
                  render={({ field }) => {
                    const enHistory = form.watch("en.history");
                    const enPresentDay = form.watch("en.presentDay");
                    const enFamousResidents = form.watch("en.famousResidents");
                    const enRenovation = form.watch("en.renovation");
                    const enStyle = form.watch("en.style");
                    const enName = form.watch("en.name");

                    const isRequired =
                      lang === Locales.hu ||
                      (lang === Locales.en &&
                        !!(
                          enHistory ||
                          enPresentDay ||
                          enFamousResidents ||
                          enRenovation ||
                          enStyle ||
                          enName ||
                          field.value
                        ));

                    return (
                      <FormItem>
                        <FormLabel required={isRequired}>
                          {t("form.summary")}
                        </FormLabel>
                        <FormDescription>
                          {t("form.descriptions.summary")}
                        </FormDescription>
                        <FormControl>
                          <Input
                            placeholder=""
                            type="text"
                            {...field}
                            maxLength={200}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t("form.type")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger value={field.value}>
                            <SelectValue placeholder={t("form.type")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {buildingTypes.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${lang}.history`}
                  defaultValue=""
                  rules={{ deps: ["en", "hu"] }}
                  render={({ field }) => {
                    const enStyle = form.watch("en.style");
                    const enPresentDay = form.watch("en.presentDay");
                    const enFamousResidents = form.watch("en.famousResidents");
                    const enRenovation = form.watch("en.renovation");
                    const enSummary = form.watch("en.summary");
                    const enName = form.watch("en.name");

                    const isRequired =
                      lang === Locales.hu ||
                      (lang === Locales.en &&
                        !!(
                          enStyle ||
                          enPresentDay ||
                          enFamousResidents ||
                          enRenovation ||
                          enSummary ||
                          enName ||
                          field.value
                        ));

                    return (
                      <FormItem>
                        <FormLabel required={isRequired}>
                          {t("building.history")}
                        </FormLabel>
                        <FormDescription>
                          {t("form.descriptions.history")}
                        </FormDescription>
                        <FormControl>
                          <Textarea placeholder="" {...field} />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name={`${lang}.style`}
                  defaultValue=""
                  rules={{ deps: ["en", "hu"] }}
                  render={({ field }) => {
                    const enHistory = form.watch("en.history");
                    const enPresentDay = form.watch("en.presentDay");
                    const enFamousResidents = form.watch("en.famousResidents");
                    const enRenovation = form.watch("en.renovation");
                    const enSummary = form.watch("en.summary");
                    const enName = form.watch("en.name");

                    const isRequired =
                      lang === Locales.hu ||
                      (lang === Locales.en &&
                        !!(
                          enHistory ||
                          enPresentDay ||
                          enFamousResidents ||
                          enRenovation ||
                          enSummary ||
                          enName ||
                          field.value
                        ));

                    return (
                      <FormItem>
                        <FormLabel required={isRequired}>
                          {t("building.style")}
                        </FormLabel>
                        <FormDescription>
                          {t("form.descriptions.style")}
                        </FormDescription>
                        <FormControl>
                          <Textarea placeholder="" {...field} />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name={`${lang}.presentDay`}
                  defaultValue=""
                  rules={{ deps: ["en", "hu"] }}
                  render={({ field }) => {
                    const enHistory = form.watch("en.history");
                    const enStyle = form.watch("en.style");
                    const enFamousResidents = form.watch("en.famousResidents");
                    const enRenovation = form.watch("en.renovation");
                    const enSummary = form.watch("en.summary");
                    const enName = form.watch("en.name");

                    const isRequired =
                      lang === Locales.hu ||
                      (lang === Locales.en &&
                        !!(
                          enHistory ||
                          enStyle ||
                          enFamousResidents ||
                          enRenovation ||
                          enSummary ||
                          enName ||
                          field.value
                        ));

                    return (
                      <FormItem>
                        <FormLabel required={isRequired}>
                          {t("building.presentDay")}
                        </FormLabel>
                        <FormDescription>
                          {t("form.descriptions.presentDay")}
                        </FormDescription>
                        <FormControl>
                          <Textarea placeholder="" {...field} />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name={`${lang}.famousResidents`}
                  defaultValue=""
                  rules={{ deps: ["en", "hu"] }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("building.famousResidents")}</FormLabel>
                      <FormControl>
                        <Textarea placeholder="" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`${lang}.renovation`}
                  defaultValue=""
                  rules={{ deps: ["en", "hu"] }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("building.renovation")}</FormLabel>
                      <FormDescription>
                        {t("form.descriptions.renovation")}
                      </FormDescription>
                      <FormControl>
                        <Textarea placeholder="" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            ))}

            <FormField
              control={form.control}
              name="position"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel required>{t("form.position")}</FormLabel>
                  <FormControl>
                    <MapPositionSelector
                      position={value}
                      setPosition={(value) => onChange(value)}
                      setCountry={(value: string) => {
                        form.setValue(`country`, value);
                        form.clearErrors(`country`);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"creatorname"}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.creatorname")}</FormLabel>
                  <FormDescription>
                    {t("form.descriptions.creatorname")}
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"creatoremail"}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.creatoremail")}</FormLabel>
                  <FormDescription>
                    {t("form.descriptions.creatoremail")}
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"source"}
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.source")}</FormLabel>
                  <FormDescription>
                    {t("form.descriptions.source")}
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {Object.values(form.formState.errors).length > 0 && (
              <p className="ml-2 text-sm text-red-500">
                {t("form.missingValues")}
              </p>
            )}
            <Button
              className="w-24"
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                Object.values(form.formState.errors).length > 0
              }
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                t("common.submit")
              )}
            </Button>
          </Tabs>
        </form>
      </Form>
      <SuccessDialog />
    </div>
  );
}
