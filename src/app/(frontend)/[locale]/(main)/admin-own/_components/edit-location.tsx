"use client";

import MapPositionSelector from "@/components/map-position-selector";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { locales, type LocaleType } from "@/lib/constans";
import {
  CityWithTranslations,
  CountyWithTranslations,
} from "@/server/db/zodSchemaTypes";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const translatedContentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const formSchema = z.object({
  en: translatedContentSchema,
  hu: translatedContentSchema,
  position: z.tuple([z.number(), z.number()]).nullable(),
});

export default function EditLocation({
  type,
  locationData,
}: {
  type: "county" | "city";
  locationData: CityWithTranslations | CountyWithTranslations;
}) {
  const [activeLanguage, setActiveLanguage] = useState<LocaleType>("hu");
  const { mutateAsync: updateCity } = api.city.updateCity.useMutation();
  const { mutateAsync: updateCounty } = api.county.updateCounty.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      en: {
        name: locationData?.en?.name ?? "",
        description: locationData?.en?.description ?? "",
      },
      hu: {
        name: locationData?.hu.name ?? "",
        description: locationData?.hu?.description ?? "",
      },
      position: locationData?.position,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      toast.loading(`Updating ${type}...`, {
        id: "location-update-toast",
      });

      // Prepare location data
      const updateData = {
        id: locationData.id,
        en: {
          name: values.en.name,
          description: values.en.description,
        },
        hu: {
          name: values.hu.name,
          description: values.hu.description,
        },
        position: values.position,
      };
      if (type === "city") {
        await updateCity(updateData, {
          onSuccess: () => {
            toast.success(`City updated successfully`, {
              id: "location-update-toast",
            });
          },
        });
      } else {
        await updateCounty(updateData, {
          onSuccess: () => {
            toast.success(`County updated successfully`, {
              id: "location-update-toast",
            });
          },
        });
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      toast.error(`Something went wrong while updating the ${type}`, {
        id: "location-update-toast",
      });
    }
  };

  if (!locationData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold capitalize">
        Edit {type}: {locationData.hu.name}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-3xl space-y-8"
        >
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
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`${lang}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${lang}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add a description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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
                            position={value || undefined}
                            setPosition={(value) => onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Button type="submit">Update {type}</Button>
        </form>
      </Form>
    </div>
  );
}
