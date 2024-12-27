"use client";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
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
import { locales, type LocaleType } from "@/lib/constans";
import { BuildingPreviewData } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  type BuildingCreate,
  type BuildingData,
  type BuildingTypes,
  type CityCreate,
  type CountyCreate,
} from "@/server/db/zodSchemaTypes";
import { createClient } from "@/supabase/client";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import Building from "./building";
import CastleIcon from "@/components/icons/castle";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";

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
  name: z.string(),
  history: z.string(),
  style: z.string(),
  presentday: z.string(),
  famousresidents: z.string().optional(),
  renovation: z.string().optional(),
  city: z.string(),
  county: z.string(),
});

const optionalSchema = z.object({
  name: z.string().optional(),
  history: z.string().optional(),
  style: z.string().optional(),
  presentday: z.string().optional(),
  famousresidents: z.string().optional(),
  renovation: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
});

export const formSchema = z.object({
  country: z.string(),
  type: z.string().optional(),
  en: optionalSchema.optional().superRefine((values, ctx) => {
    console.log("VALUES", values);
    // if `en` is not even provided, skip
    if (!values) {
      return;
    }

    const { name, history, style, presentday } = values;

    // Check if ANY of these 4 fields has content
    const hasAnyEnContent = !!(
      name?.trim() ||
      history?.trim() ||
      style?.trim() ||
      presentday?.trim()
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
      if (!presentday?.trim()) {
        ctx.addIssue({
          path: ["presentday"],
          code: "custom",
          message: "Present day is required if any English field is filled",
        });
      }
    } else {
    }
  }),
  hu: translatedContentSchema,
  featuredImage: z.array(fileSchema),
  images: z.array(fileSchema),
  position: z.tuple([z.number(), z.number()]),
});

export default function BuildingForm({
  buildingTypes,
}: {
  buildingTypes: BuildingTypes[];
}) {
  const t = useTranslations();
  const { mutateAsync: createBuilding } =
    api.building.createBuilding.useMutation();
  const { mutateAsync: createCounty } = api.county.createCounty.useMutation();
  const { mutateAsync: createCity } = api.city.createCity.useMutation();
  const trpc = api.useUtils();
  const [preview, setPreview] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<LocaleType>("hu");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const supabaseClient = createClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const baseFolder = `building/${slugify(values.hu.name)}`;
    const featuredImage = values.featuredImage[0];
    if (!featuredImage) {
      toast.error(t("toast.featuredImageError"), {
        id: "building-creation-toast",
      });
      return;
    }
    const featuredFileExt = featuredImage.name.split(".").pop();
    const featuredPath = `${baseFolder}/featured.${featuredFileExt}`;
    try {
      toast.loading(t("toast.creatingBuilding"), {
        id: "building-creation-toast",
      });

      // Compress featured image if larger than 1MB
      const featuredImageToUpload =
        featuredImage.size > 1024 * 1024
          ? await compressImage(featuredImage)
          : featuredImage;

      const { error: featuredError } = await supabaseClient.storage
        .from("heritagebuilder-test")
        .upload(featuredPath, featuredImageToUpload);

      if (featuredError) throw featuredError;

      // Upload and compress additional images if needed
      const uploadedImagePaths = await Promise.all(
        values.images.map(async (image, i) => {
          const fileExtension = image.name.split(".").pop();
          const filePath = `${baseFolder}/${i + 1}.${fileExtension}`;

          const imageToUpload =
            image.size > 1024 * 1024 ? await compressImage(image) : image;

          const { error } = await supabaseClient.storage
            .from("heritagebuilder-test")
            .upload(filePath, imageToUpload);

          if (error) throw error;
          return filePath;
        }),
      );
      // get countyid if exits, insert a new county if not
      let countyid = await trpc.county.getCountyIdBySlug
        .fetch({
          slug: slugify(values.hu.county),
          lang: "hu",
        })
        .catch(() => undefined);
      if (!countyid) {
        const countyData: CountyCreate = {
          countryid: values.country,
          en: {
            slug: slugify(values.hu.county),
            name: values.hu.county,
            language: "en",
          },
          hu: {
            slug: slugify(values.hu.county),
            name: values.hu.county,
            language: "hu",
          },
          regionid: null,
          position: null,
        };

        await createCounty(
          { ...countyData },
          {
            onSuccess: (data) => (countyid = data),
            onError: () => {
              throw new Error();
            },
          },
        );
      }
      if (!countyid) throw new Error();
      //get cityid if exits, insert a new city if not
      let cityid = await trpc.city.getCityIdBySlug
        .fetch({
          slug: slugify(values.hu.city),
          lang: "hu",
        })
        .catch(() => undefined);
      if (!cityid) {
        const cityData: CityCreate = {
          countryid: values.country,
          countyid,
          en: {
            slug: slugify(values.hu.city),
            name: values.hu.city,
            language: "en",
          },
          hu: {
            slug: slugify(values.hu.city),
            name: values.hu.city,
            language: "hu",
          },
          position: null,
        };

        await createCity(
          { ...cityData },
          {
            onSuccess: (data) => (cityid = data),
            onError: () => {
              throw new Error();
            },
          },
        );
      }
      if (!cityid) throw new Error();
      // Prepare building data
      const buildingData = {
        featuredImage: featuredPath,
        images: uploadedImagePaths,
        countryid: values.country,
        countyid,
        cityid,
        buildingtypeid: parseInt(values.type ?? "1"),
        status: "pending",
        position: values.position,
      };

      // Check if EN data exists and has any non-empty values
      const hasEnglishData =
        values.en &&
        Object.values(values.en).some((value) => value && value.trim() !== "");

      // Prepare translation data
      const translationData = {
        hu: {
          slug: slugify(values.hu.name),
          name: values.hu.name,
          language: "hu",
          history: values.hu.history,
          style: values.hu.style,
          presentday: values.hu.presentday,
          famousresidents: values.hu.famousresidents ?? null,
          renovation: values.hu.renovation ?? null,
        },
        ...(hasEnglishData && {
          en: {
            slug: slugify(values.en!.name || values.hu.name),
            name: values.en!.name || values.hu.name,
            language: "en",
            history: values.en!.history || values.hu.history,
            style: values.en!.style || values.hu.style,
            presentday: values.en!.presentday || values.hu.presentday,
            famousresidents:
              values.en!.famousresidents ?? values.hu.famousresidents ?? null,
            renovation: values.en!.renovation ?? values.hu.renovation ?? null,
          },
        }),
      } as {
        en?: BuildingData;
        hu: BuildingData;
      };

      const insertBuilding: BuildingCreate = {
        ...buildingData,
        ...translationData,
      };

      await createBuilding(insertBuilding, {
        onSuccess: () => {
          toast.success(t("toast.buildingCreated"), {
            id: "building-creation-toast",
          });
          setShowSuccessDialog(true);
        },
      });
    } catch (error) {
      const filePaths = values.images.map((image, i) => {
        const fileExtension = image.name.split(".").pop();
        const filePath = `${baseFolder}/${i + 1}.${fileExtension}`;
        return filePath;
      });
      await supabaseClient.storage
        .from("heritagebuilder-test")
        .remove([...filePaths, featuredPath]);
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
      famousresidents: languageData!.famousresidents ?? null,
      renovation: languageData!.renovation ?? null,
      buildingtypeid: parseInt(type ?? "0"),
    };
    return <Building building={previewData as BuildingPreviewData} />;
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
                      name={`${lang}.presentday`}
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
                      name={`${lang}.famousresidents`}
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
                      setCounty={async (value: string, lang: LocaleType) =>
                        form.setValue(`${lang}.county`, value)
                      }
                      setCity={async (value: string, lang: LocaleType) =>
                        form.setValue(`${lang}.city`, value)
                      }
                    />
                  </FormControl>
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
