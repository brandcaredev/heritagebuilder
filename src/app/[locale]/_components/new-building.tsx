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
  type CityCreate,
  type CountyCreate,
} from "@/server/db/zodSchemaTypes";
import { createClient } from "@/supabase/client";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import Building from "./building";

const MapPositionSelector = dynamic(
  () => import("@/components/map-position-selector"),
  { ssr: false },
);

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

const formSchema = z.object({
  country: z.string(),
  type: z.string().optional(),
  en: translatedContentSchema,
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
  const { mutateAsync: createBuilding } =
    api.building.createBuilding.useMutation();
  const { mutateAsync: createCounty } = api.county.createCounty.useMutation();
  const { mutateAsync: createCity } = api.city.createCity.useMutation();
  const trpc = api.useUtils();
  const [preview, setPreview] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<LocaleType>("en");
  const supabaseClient = createClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      en: {
        name: "",
        history: "",
        style: "",
        presentday: "",
        famousresidents: "",
        renovation: "",
      },
      hu: {
        name: "",
        history: "",
        style: "",
        presentday: "",
        famousresidents: "",
        renovation: "",
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const baseFolder = `building/${slugify(values.hu.name)}`;
    const featuredImage = values.featuredImage[0];
    if (!featuredImage) {
      toast.error(
        "Something went wrong while creating the building - Featured image failed",
        {
          id: "building-creation-toast",
        },
      );
      return;
    }
    const featuredFileExt = featuredImage.name.split(".").pop();
    const featuredPath = `${baseFolder}/featured.${featuredFileExt}`;
    try {
      toast.loading("Creating the building...", {
        id: "building-creation-toast",
      });
      // // Upload featured image and other images to Supabase

      const { error: featuredError } = await supabaseClient.storage
        .from("heritagebuilder-test")
        .upload(featuredPath, featuredImage);

      if (featuredError) throw featuredError;

      // Upload additional images
      const uploadedImagePaths = await Promise.all(
        values.images.map(async (image, i) => {
          const fileExtension = image.name.split(".").pop();
          const filePath = `${baseFolder}/${i + 1}.${fileExtension}`;

          const { error } = await supabaseClient.storage
            .from("heritagebuilder-test")
            .upload(filePath, image);

          if (error) throw error;
          return filePath;
        }),
      );
      // get countyid if exits, insert a new county if not
      let countyid = await trpc.county.getCountyIdBySlug
        .fetch({
          slug: slugify(values.en.county),
          lang: "en",
        })
        .catch(() => undefined);
      if (!countyid) {
        const countyData: CountyCreate = {
          countryid: values.country,
          en: {
            slug: slugify(values.en.county),
            name: values.en.county,
            language: "en",
          },
          hu: {
            slug: slugify(values.hu.county),
            name: values.hu.county,
            language: "hu",
          },
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
          slug: slugify(values.en.city),
          lang: "en",
        })
        .catch(() => undefined);
      if (!cityid) {
        const cityData: CityCreate = {
          countryid: values.country,
          countyid,
          en: {
            slug: slugify(values.en.city),
            name: values.en.city,
            language: "en",
          },
          hu: {
            slug: slugify(values.hu.city),
            name: values.hu.city,
            language: "hu",
          },
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
        disabled: true,
        position: values.position,
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

      const insertBuilding: BuildingCreate = {
        ...buildingData,
        ...translationData,
      };
      await createBuilding(insertBuilding, {
        onSuccess: () => {
          toast.success("Building created successfully", {
            id: "building-creation-toast",
          });
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
      toast.error("Something went wrong while creating the building", {
        id: "building-creation-toast",
      });
    }
  };

  const getPreviewComponent = () => {
    const formData = form.getValues();
    const { en, hu, ...rest } = formData;
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
      famousresidents: languageData.famousresidents ?? null,
      renovation: languageData.renovation ?? null,
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

            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <div className="space-y-6">
                  <FormItem className="w-full">
                    <FormLabel>Featured image</FormLabel>
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

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <div className="space-y-6">
                  <FormItem className="w-full">
                    <FormLabel>Images</FormLabel>
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

            <FormField
              control={form.control}
              name="position"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      )}
    </div>
  );
}
