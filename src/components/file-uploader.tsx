"use client";

import { Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import * as React from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { formSchema } from "@/app/(frontend)/[locale]/_components/new-building";
import { cn } from "@/lib/utils";
import { UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormField, FormItem, FormLabel } from "./ui";

import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

type Props = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function FileUploader(props: Props) {
  const { form } = props;

  const images = useWatch({
    control: form.control,
    name: "images",
  });
  const featuredImage = useWatch({
    control: form.control,
    name: "featuredImage",
  });

  const t = useTranslations("fileUploader");

  const onDrop = React.useCallback(
    (
      onChange: (files: File[]) => void,
      value: File[],
      acceptedFiles: File[],
      rejectedFiles: FileRejection[],
      multiple: boolean,
      maxFileCount: number,
      featured?: boolean,
    ) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error(t("maxFileError"));
        return;
      }

      if (featured && acceptedFiles.length > 1) {
        toast.error(t("maxFileError"));
        return;
      } else if ((value?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(t("maxFilesError", { count: maxFileCount }));
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

      if (featured) {
        onChange(newFiles);
      } else {
        const updatedFiles = value ? [...value, ...newFiles] : newFiles;
        onChange(updatedFiles);
      }

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(t("fileRejected", { name: file.name }));
        });
      }
    },
    [t],
  );

  function onRemove(
    onChange: (files: File[]) => void,
    value: File[],
    index: number,
    featured?: boolean,
  ) {
    if (featured) {
      if (!value) return;
      form.resetField("featuredImage");
    } else {
      if (!value) return;
      const newFiles = value.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        form.resetField("images");
      } else {
        onChange(newFiles);
      }
    }
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!images) return;
      images.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    return () => {
      if (!featuredImage) return;
      featuredImage.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = (images?.length ?? 0) >= 4;
  const featuredIsDisabled = (featuredImage?.length ?? 0) >= 1;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <div
        className={cn(
          "group relative h-[400px] flex-col gap-4 rounded-lg border border-brown-900 md:h-[700px]",
          !!featuredImage?.length && "border-0",
        )}
      >
        {featuredImage?.map((file, index) => (
          <FileCard
            key={index}
            file={file}
            onRemove={() =>
              onRemove(
                (file: File[]) => form.setValue("featuredImage", file),
                featuredImage,
                index,
                true,
              )
            }
          />
        ))}
      </div>
      <Carousel>
        <CarouselContent className="ml-0 flex gap-4">
          {[...Array(5).keys()].map((i) => (
            <CarouselItem key={i}>
              <div
                className={cn(
                  "group relative h-32 w-32 rounded-lg border border-brown-900 bg-transparent",
                  !!images?.[i] && "border-0",
                )}
              >
                {images?.[i] ? (
                  <FileCard
                    file={images[i]}
                    onRemove={() =>
                      onRemove(
                        (file: File[]) => form.setValue("images", file),
                        images,
                        i,
                      )
                    }
                  />
                ) : null}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <FormField
        control={form.control}
        name={`featuredImage`}
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel required>{t("form.featuredImage")}</FormLabel>
            <Dropzone
              onDrop={(acceptedFiles, rejectedFiles) =>
                onDrop(
                  onChange,
                  value,
                  acceptedFiles,
                  rejectedFiles,
                  false,
                  1,
                  true,
                )
              }
              accept={{ "image/*": [] }}
              maxFiles={1}
              multiple={false}
              disabled={featuredIsDisabled}
            >
              {({ getRootProps, getInputProps, isDragActive }) => (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-muted-foreground/25 hover:bg-muted/25 group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed px-5 py-2.5 text-center transition",
                    "ring-offset-background focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    isDragActive && "border-muted-foreground/50",
                    featuredIsDisabled && "pointer-events-none opacity-60",
                  )}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                      <div className="rounded-full border border-dashed p-3">
                        <Upload
                          className="text-muted-foreground size-7"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {t("dropHere")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                      <div className="rounded-full border border-dashed p-3">
                        <Upload
                          className="text-muted-foreground size-7"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-col gap-px">
                        <p className="text-muted-foreground font-medium">
                          {t("dragAndDrop")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Dropzone>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`images`}
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel required>{t("form.images")}</FormLabel>
            <Dropzone
              onDrop={(acceptedFiles, rejectedFiles) =>
                onDrop(onChange, value, acceptedFiles, rejectedFiles, true, 5)
              }
              accept={{ "image/*": [] }}
              maxFiles={5}
              multiple={true}
              disabled={isDisabled}
            >
              {({ getRootProps, getInputProps, isDragActive }) => (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-muted-foreground/25 hover:bg-muted/25 group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed px-5 py-2.5 text-center transition",
                    "ring-offset-background focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    isDragActive && "border-muted-foreground/50",
                    isDisabled && "pointer-events-none opacity-60",
                  )}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                      <div className="rounded-full border border-dashed p-3">
                        <Upload
                          className="text-muted-foreground size-7"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        {t("dropHere")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                      <div className="rounded-full border border-dashed p-3">
                        <Upload
                          className="text-muted-foreground size-7"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-col gap-px">
                        <p className="text-muted-foreground font-medium">
                          {t("dragAndDrop")}
                        </p>
                        <p className="text-muted-foreground/70 text-sm">
                          {t("multipleFiles", {
                            count: 5,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Dropzone>
          </FormItem>
        )}
      />
    </div>
  );
}

function FileCard({
  file,
  featured,
  onRemove,
}: {
  file: File;
  featured?: boolean;
  onRemove: () => void;
}) {
  if (isFileWithPreview(file)) {
    return (
      <>
        <Image
          src={file.preview}
          alt={file.name}
          fill
          loading="lazy"
          className={cn("object-cover", !featured && "aspect-square")}
        />
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
        >
          <Trash2 className="h-6 w-6 text-white" />
        </div>
      </>
    );
  }
  return null;
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string";
}
