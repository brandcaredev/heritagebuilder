"use client";
import { FileUploader } from "@/components/file-uploader";
import CastleIcon from "@/components/icons/castle";
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
import { locales, type LocaleType } from "@/lib/constans";
import { slugify } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { BuildingType, Building as IBuilding } from "payload-types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import Building from "./building";

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
  summary: z.string(),
  name: z.string(),
  history: z.string(),
  style: z.string(),
  presentDay: z.string(),
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
  en: optionalSchema.partial().superRefine((values, ctx) => {
    // if `en` is not even provided, skip
    if (!values) {
      return;
    }

    const { name, history, style, presentDay, summary } = values;

    // Check if ANY of these 4 fields has content
    const hasAnyEnContent = !!(
      summary?.trim() ||
      name?.trim() ||
      history?.trim() ||
      style?.trim() ||
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
}: {
  buildingTypes: BuildingType[];
}) {
  const t = useTranslations();
  const { mutateAsync: createCounty } = api.county.createCounty.useMutation();
  const { mutateAsync: createCity } = api.city.createCity.useMutation();
  const trpc = api.useUtils();
  const [preview, setPreview] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<LocaleType>("hu");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  // TODO ERROR HANDLING
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

      // TODO: USE THE BUILT IN PAYLOAD COMPRESSOR
      // Compress featured image if larger than 1MB
      const featuredImageToUpload =
        featuredImage.size > 1024 * 1024
          ? await compressImage(featuredImage)
          : featuredImage;

      const imageFormData = new FormData();
      imageFormData.append("file", featuredImageToUpload);
      const reqFeaturedImage = await fetch(`/api/buildings-media`, {
        credentials: "include",
        method: "POST",
        body: imageFormData,
      }).then((res) => res.json());
      const featuredImageID = reqFeaturedImage.doc.id;
      // Upload and compress additional images if needed

      const imageIDs = await Promise.all(
        values.images.map(async (image) => {
          const imageFormData = new FormData();
          const imageToUpload =
            image.size > 1024 * 1024 ? await compressImage(image) : image;
          imageFormData.append(`file`, imageToUpload);

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
        country: values.country,
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
      }).then((res) => res.json());

      const hasEnglishData =
        values.en &&
        Object.entries(values.en).some(
          ([key, value]) =>
            value && value.trim() !== "" && key !== "city" && key !== "county",
        );

      if (hasEnglishData) {
        const enPayload = {
          name: values.en.name,
          summary: values.en.summary,
          slug: slugify(values.en.name!),
          history: values.en.history,
          style: values.en.style,
          presentDay: values.en.presentDay,
          famousResidents: values.en.famousResidents || "",
          renovation: values.en.renovation || "",
          country: values.country,
        };
        await fetch(`/api/buildings/${hunResponse.doc.id}?locale=en`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(enPayload),
        }).then((res) => res.json());
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

  const getPreviewComponent = () => {
    const formData = form.getValues();
    const hasEnglishData =
      formData.en &&
      Object.entries(formData.en).some(
        ([key, value]) =>
          value && value.trim() !== "" && key !== "city" && key !== "county",
      );
    if (activeLanguage === "en" && !hasEnglishData) {
      return null;
    }

    const { en, hu, type, ...rest } = formData;
    const languageData = activeLanguage === "en" ? en : hu;
    const previewData = {
      ...rest,
      ...languageData,
      images: formData.images.map(
        (img) => (img as File & { preview: string }).preview,
      ),
      featuredImage: (
        formData.featuredImage[0] as File & {
          preview: string;
        }
      ).preview,
      famousResidents: languageData.famousResidents ?? null,
      renovation: languageData.renovation ?? null,
      buildingType: {
        id: parseInt(type),
      } as BuildingType,
      updatedAt: null,
      createdAt: null,
      id: -1,
      slug: "",
    };
    const buildingImages = [previewData.featuredImage, ...previewData.images];
    return (
      <Building
        building={previewData as unknown as IBuilding}
        buildingImages={buildingImages}
      />
    );
  };

  const SuccessDialog = () => {
    const router = useRouter();

    return (
      <Dialog open={showSuccessDialog} onOpenChange={() => router.replace("/")}>
        <DialogContent className="z-[9999] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex justify-center text-2xl font-semibold text-brown">
              {t("successDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6 text-center">
            <div className="text-brown-700">
              <CastleIcon width={64} height={64} />
            </div>
            <p className="text-gray-600">{t("successDialog.uploadSuccess")}</p>
            <p className="text-gray-600">{t("successDialog.description")}</p>
            <div className="flex space-x-4"></div>
          </div>
          <DialogFooter className="gap-4">
            <Button variant="outline" onClick={() => router.replace("/")}>
              {t("common.goToHome")}
            </Button>

            <Button onClick={() => router.refresh()}>
              {t("common.createAnother")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div>
      <Button onClick={() => setPreview((prev) => !prev)}>
        {preview ? t("common.edit") : t("common.preview")}
      </Button>
      {preview ? (
        getPreviewComponent()
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-3xl space-y-8 py-10"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.type")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buildingTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Tabs
              value={activeLanguage}
              onValueChange={(v) => setActiveLanguage(v as LocaleType)}
            >
              <TabsList>
                {Object.values(locales).map((locale) => (
                  <TabsTrigger key={locale} value={locale}>
                    {t(`common.${locale}`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.values(locales).map((lang) => (
                <TabsContent key={lang} value={lang}>
                  <FormField
                    control={form.control}
                    name={`${lang}.summary`}
                    rules={{ deps: ["en", "hu"] }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.summary")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder=""
                            type="text"
                            {...field}
                            maxLength={200}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("form.descriptions.summary")}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${lang}.name`}
                    rules={{ deps: ["en", "hu"] }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.name")}</FormLabel>
                        <FormControl>
                          <Input placeholder="" type="text" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t("form.descriptions.name")}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name={`${lang}.history`}
                      rules={{ deps: ["en", "hu"] }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("building.history")}</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("form.descriptions.history")}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${lang}.style`}
                      rules={{ deps: ["en", "hu"] }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("building.style")}</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("form.descriptions.style")}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${lang}.presentDay`}
                      rules={{ deps: ["en", "hu"] }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("building.presentDay")}</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("form.descriptions.presentDay")}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${lang}.famousResidents`}
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
                      rules={{ deps: ["en", "hu"] }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("building.renovation")}</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("form.descriptions.renovation")}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <div className="space-y-6">
                  <FormItem className="w-full">
                    <FormLabel>{t("form.featuredImage")}</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFileCount={1}
                        maxSize={4 * 1024 * 1024}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <div className="space-y-6">
                  <FormItem className="w-full">
                    <FormLabel>{t("form.images")}</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFileCount={4}
                        maxSize={4 * 1024 * 1024}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>{t("form.position")}</FormLabel>
                  <FormControl>
                    <MapPositionSelector
                      type={parseInt(form.getValues().type ?? "1")}
                      position={value}
                      setPosition={(value) => onChange(value)}
                      setCountry={(value: string) =>
                        form.setValue(`country`, value)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"creatorname"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.creatorname")}</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("form.descriptions.creatorname")}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"creatoremail"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.creatoremail")}</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("form.descriptions.creatoremail")}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"source"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.source")}</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("form.descriptions.source")}
                  </FormDescription>
                </FormItem>
              )}
            />

            <Button type="submit">{t("common.submit")}</Button>
          </form>
        </Form>
      )}
      <SuccessDialog />
    </div>
  );
}
