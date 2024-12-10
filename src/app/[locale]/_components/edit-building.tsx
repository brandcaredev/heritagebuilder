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
  FormMessage,
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
import { slugify } from "@/lib/utils";
import {
  type BuildingCreate,
  type BuildingData,
  type BuildingTypes,
} from "@/server/db/zodSchemaTypes";
import { createClient } from "@/supabase/client";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import Building from "./building";
import { useRouter } from "@/i18n/routing";

const fileSchema = z.instanceof(File);

const translatedContentSchema = z.object({
  name: z.string(),
  history: z.string(),
  style: z.string(),
  presentday: z.string(),
  famousresidents: z.string().optional(),
  renovation: z.string().optional(),
});

const formSchema = z.object({
  country: z.string(),
  type: z.string().optional(),
  en: translatedContentSchema,
  hu: translatedContentSchema,
  featuredImage: z.array(fileSchema).optional(),
  images: z.array(fileSchema).optional(),
  position: z.tuple([z.number(), z.number()]),
});

interface ExistingBuilding {
  id: number;
  featuredImage: string;
  images: string[];
  countryid: string;
  countyid: number;
  cityid: number;
  buildingtypeid: number;
  position: [number, number];
  en?: BuildingData;
  hu: BuildingData;
}

export default function EditBuildingForm({
  buildingTypes,
  building,
}: {
  buildingTypes: BuildingTypes[];
  building: ExistingBuilding;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { mutateAsync: updateBuilding } =
    api.building.updateBuilding.useMutation();
  const [preview, setPreview] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<LocaleType>("en");
  const supabaseClient = createClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: building.countryid,
      type: building.buildingtypeid.toString(),
      position: building.position,
      en: {
        name: building.en?.name ?? "",
        history: building.en?.history ?? "",
        style: building.en?.style ?? "",
        presentday: building.en?.presentday ?? "",
        famousresidents: building.en?.famousresidents ?? "",
        renovation: building.en?.renovation ?? "",
      },
      hu: {
        name: building.hu.name,
        history: building.hu.history,
        style: building.hu.style,
        presentday: building.hu.presentday,
        famousresidents: building.hu.famousresidents ?? "",
        renovation: building.hu.renovation ?? "",
      },
    },
  });

  const {
    data: { publicUrl: featuredImagePublicUrl },
  } = supabase.storage
    .from("heritagebuilder-test")
    .getPublicUrl(building.featuredImage ?? "");

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const baseFolder = `building/${slugify(values.hu.name)}`;
    let featuredImagePath = building.featuredImage;
    let imagesPaths = building.images;

    try {
      toast.loading("Updating the building...", {
        id: "building-update-toast",
      });

      // Handle featured image update if provided
      if (values.featuredImage?.[0]) {
        const featuredImage = values.featuredImage[0];
        const featuredFileExt = featuredImage.name.split(".").pop();
        featuredImagePath = `${baseFolder}/featured.${featuredFileExt}`;

        const featuredImageToUpload =
          featuredImage.size > 1024 * 1024
            ? await compressImage(featuredImage)
            : featuredImage;

        // Delete old featured image
        await supabaseClient.storage
          .from("heritagebuilder-test")
          .remove([building.featuredImage]);

        const { error: featuredError } = await supabaseClient.storage
          .from("heritagebuilder-test")
          .upload(featuredImagePath, featuredImageToUpload);

        if (featuredError) throw featuredError;
      }

      // Handle additional images update if provided
      if (values.images?.length) {
        // Delete old images
        await supabaseClient.storage
          .from("heritagebuilder-test")
          .remove(building.images);

        // Upload new images
        imagesPaths = await Promise.all(
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
      }

      // Prepare building data
      const buildingData = {
        id: building.id,
        featuredImage: featuredImagePath,
        images: imagesPaths,
        countryid: values.country,
        countyid: building.countyid,
        cityid: building.cityid,
        buildingtypeid: parseInt(values.type ?? "1"),
        position: values.position,
        status: "pending",
      };

      // Prepare translation data
      const translationData = Object.entries(locales).reduce(
        (prev, [curr, lang]) => {
          const data = {
            slug: slugify(values[lang as LocaleType].name),
            name: values[lang as LocaleType].name,
            language: curr,
            history: values[lang as LocaleType].history,
            style: values[lang as LocaleType].style,
            presentday: values[lang as LocaleType].presentday,
            famousresidents: values[lang as LocaleType].famousresidents ?? null,
            renovation: values[lang as LocaleType].renovation ?? null,
          };
          return Object.assign(prev, { [lang]: data });
        },
        {},
      ) as {
        en: BuildingData;
        hu: BuildingData;
      };

      const updateBuildingData: BuildingCreate & { id: number } = {
        ...buildingData,
        ...translationData,
      };

      await updateBuilding(updateBuildingData, {
        onSuccess: () => {
          toast.success("Building updated successfully", {
            id: "building-update-toast",
          });
          router.refresh();
        },
      });
    } catch (error) {
      console.error("Error updating building:", error);
      toast.error("Something went wrong while updating the building", {
        id: "building-update-toast",
      });
    }
  };

  const getPreviewComponent = () => {
    const formData = form.getValues();
    const { en, hu, ...rest } = formData;
    const languageData = activeLanguage === "en" ? en : hu;

    // For preview, use either the new uploaded images or existing ones
    const previewImages = formData.images
      ? formData.images.map(
          (img) => (img as File & { preview: string }).preview,
        )
      : building.images.map((img) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from("heritagebuilder-test").getPublicUrl(img);
          return publicUrl;
        });

    const previewFeaturedImage = formData.featuredImage?.[0]
      ? (formData.featuredImage[0] as File & { preview: string }).preview
      : featuredImagePublicUrl;

    const previewData = {
      ...rest,
      ...languageData,
      images: previewImages,
      featuredImage: previewFeaturedImage,
      famousresidents: languageData.famousresidents ?? null,
      renovation: languageData.renovation ?? null,
      buildingtypeid: parseInt(rest.type ?? "0"),
    };
    return <Building building={previewData} />;
  };

  return (
    <div>
      <Button onClick={() => setPreview((prev) => !prev)}>
        {preview ? "Edit" : "Preview"}
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
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="" />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Tabs
              value={activeLanguage}
              onValueChange={(v) => setActiveLanguage(v as LocaleType)}
            >
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="hu">Hungarian</TabsTrigger>
              </TabsList>

              {Object.values(locales).map((lang) => (
                <TabsContent key={lang} value={lang}>
                  <FormField
                    control={form.control}
                    name={`${lang}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="" type="text" {...field} />
                        </FormControl>
                        <FormDescription>Name of the building</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name={`${lang}.history`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>History</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            The history of the building
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${lang}.style`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Style</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            Architectural style and appearance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${lang}.presentday`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Present day</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            Present day situation, function
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${lang}.famousresidents`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Famous residents</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`${lang}.renovation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Renovation</FormLabel>
                          <FormControl>
                            <Textarea placeholder="" {...field} />
                          </FormControl>
                          <FormDescription>
                            The status or the story of the renovation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div>
              <h3 className="mb-4 text-lg font-medium">
                Current Featured Image
              </h3>
              <div className="relative mb-4 h-48 w-48">
                <Image
                  src={featuredImagePublicUrl}
                  alt="Featured"
                  fill
                  className="object-cover"
                />
              </div>
              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <div className="space-y-6">
                    <FormItem className="w-full">
                      <FormLabel>Update Featured Image</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFileCount={1}
                          maxSize={4 * 1024 * 1024}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Current Images</h3>
              <div className="mb-4 grid grid-cols-4 gap-4">
                {building.images.map((image, index) => {
                  const {
                    data: { publicUrl },
                  } = supabase.storage
                    .from("heritagebuilder-test")
                    .getPublicUrl(image);

                  return (
                    <div key={index} className="relative h-32 w-32">
                      <Image
                        src={publicUrl}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </div>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <div className="space-y-6">
                    <FormItem className="w-full">
                      <FormLabel>Update Images</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFileCount={4}
                          maxSize={4 * 1024 * 1024}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
            </div>
            <Button type="submit">Update Building</Button>
          </form>
        </Form>
      )}
    </div>
  );
}
