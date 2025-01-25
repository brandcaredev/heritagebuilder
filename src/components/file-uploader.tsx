"use client";

import { Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import * as React from "react";
import Dropzone, { type FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cn } from "@/lib/utils";

type Props = {
  featuredImage: File[];
  featuredImageChange: (files: File[]) => void;
  images: File[];
  imagesChange: (files: File[]) => void;
};

export function FileUploader(props: Props) {
  const { featuredImage, featuredImageChange, images, imagesChange } = props;

  const [files, setFiles] = useControllableState({
    prop: images,
    onChange: imagesChange,
  });

  const [featuredImageFiles, setFeaturedImageFiles] = useControllableState({
    prop: featuredImage,
    onChange: featuredImageChange,
  });

  const t = useTranslations("fileUploader");

  const onDrop = React.useCallback(
    (
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
      } else if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(t("maxFilesError", { count: maxFileCount }));
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );
      if (featured) {
        setFeaturedImageFiles(newFiles);
      } else {
        const updatedFiles = files ? [...files, ...newFiles] : newFiles;
        setFiles(updatedFiles);
      }

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(t("fileRejected", { name: file.name }));
        });
      }
    },
    [files, setFeaturedImageFiles, setFiles, t],
  );

  function onRemove(index: number, featured?: boolean) {
    if (featured) {
      if (!featuredImageFiles) return;
      const newFiles = featuredImageFiles.filter((_, i) => i !== index);
      setFeaturedImageFiles(newFiles);
      featuredImageChange(newFiles);
    } else {
      if (!files) return;
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      imagesChange(newFiles);
    }
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    return () => {
      if (!featuredImageFiles) return;
      featuredImageFiles.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isDisabled = (files?.length ?? 0) >= 4;
  const featuredIsDisabled = (featuredImageFiles?.length ?? 0) >= 1;
  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <div
        className={cn(
          "group relative h-[400px] flex-col gap-4 rounded-lg border border-brown-900 md:h-[700px]",
          !!featuredImageFiles?.length && "border-0",
        )}
      >
        {featuredImageFiles?.map((file, index) => (
          <FileCard
            key={index}
            file={file}
            onRemove={() => onRemove(index, true)}
          />
        ))}
      </div>
      <ScrollArea>
        <div className="flex w-max space-x-4 p-4">
          {[...Array(5).keys()].map((i) => (
            <div
              key={i}
              className={cn(
                "group relative h-32 w-32 rounded-lg border border-brown-900 bg-transparent",
                !!files?.[i] && "border-0",
              )}
            >
              {files?.[i] ? (
                <FileCard file={files[i]} onRemove={() => onRemove(i)} />
              ) : null}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Dropzone
        onDrop={(acceptedFiles, rejectedFiles) =>
          onDrop(acceptedFiles, rejectedFiles, false, 1, true)
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

      <Dropzone
        onDrop={(acceptedFiles, rejectedFiles) =>
          onDrop(acceptedFiles, rejectedFiles, true, 4)
        }
        accept={{ "image/*": [] }}
        maxFiles={4}
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
                      count: 4,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
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
  const t = useTranslations("fileUploader");

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
