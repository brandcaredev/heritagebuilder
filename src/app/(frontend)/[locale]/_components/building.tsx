"use client";
import { Button, Input, Textarea } from "@/components/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { Building, BuildingType } from "payload-types";
import { useState } from "react";
import { toast } from "sonner";
import GalleryWithDialog from "./image-gallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/auth";

const MapPosition = dynamic(() => import("@/components/map-position"), {
  ssr: false,
  loading: () => <Skeleton className={"h-[400px] w-full md:h-[600px]"} />,
});

type EditableFields =
  | "name"
  | "history"
  | "style"
  | "famousResidents"
  | "renovation"
  | "presentDay"
  | null;

export default function BuildingComponent({
  building,
  buildingImages,
}: {
  building: Building;
  buildingImages: string[];
}) {
  const t = useTranslations();
  const [editingField, setEditingField] = useState<EditableFields>(null);

  const { data } = useQuery({
    queryFn: async () => (await supabase.auth.getUser()).data,
    queryKey: ["user"],
    staleTime: 0,
  });

  const submitSuggestion = async (formData: FormData) => {
    const field = formData.get("field") as string;
    const buildingId = formData.get("buildingId") as string;
    const content = formData.get("content") as string;
    const submitterName = formData.get("submitterName") as string;

    try {
      const response = await fetch("/api/building-suggestions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          building: parseInt(buildingId),
          field,
          suggestedContent: content,
          submitterName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit suggestion");
      }
      setEditingField(null);
      toast.success("Suggestion submitted successfully");
    } catch (e) {
      toast.error("Failed to submit suggestion");
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex flex-col gap-4 lg:w-1/2">
        <GalleryWithDialog images={buildingImages} />
        <MapPosition
          position={building.position}
          type={(building.buildingType as BuildingType).id}
          className="h-[400px] w-full md:h-[600px]"
        />
      </div>
      <ScrollArea className="lg:max-h-[1440px] lg:w-1/2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {editingField === "name" ? (
              <form
                className="flex w-full flex-col gap-2"
                action={submitSuggestion}
              >
                <input type="hidden" name="field" value="history" />
                <input type="hidden" name="buildingId" value={building.id} />
                <Input
                  defaultValue={building.name}
                  name="content"
                  className="w-full"
                />
                <div className="flex flex-col gap-1">
                  <Input
                    placeholder={t("building.creatorName")}
                    name="submitterName"
                    className="w-full"
                  />
                  <small className="text-gray-500">
                    {t("building.creatorDescription")}
                  </small>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit">{t("common.submit")}</Button>
                </div>
              </form>
            ) : (
              <h1 className="text-4xl font-bold text-brown">{building.name}</h1>
            )}
            {editingField !== "name" && data?.user && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingField("name")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("building.suggestEdit")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-brown">
                {t("building.history")}
              </h3>
              {editingField !== "history" && data?.user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingField("history")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("building.suggestEdit")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {editingField === "history" ? (
              <form className="flex flex-col gap-2" action={submitSuggestion}>
                <input type="hidden" name="field" value="history" />
                <input type="hidden" name="buildingId" value={building.id} />
                <Textarea
                  name="content"
                  defaultValue={building.history}
                  className="min-h-[100px]"
                />
                <div className="flex flex-col gap-1">
                  <Input
                    placeholder={t("building.creatorName")}
                    name="submitterName"
                    className="w-full"
                  />
                  <small className="text-gray-500">
                    {t("building.creatorDescription")}
                  </small>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit">{t("common.submit")}</Button>
                </div>
              </form>
            ) : (
              <span className="text-justify font-source-sans-3">
                {building.history}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-brown">
                {t("building.style")}
              </h3>
              {editingField !== "style" && data?.user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingField("style")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("building.suggestEdit")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {editingField === "style" ? (
              <form className="flex flex-col gap-2" action={submitSuggestion}>
                <input type="hidden" name="field" value="style" />
                <input type="hidden" name="buildingId" value={building.id} />
                <Textarea
                  name="content"
                  defaultValue={building.style}
                  className="min-h-[100px]"
                />
                <div className="flex flex-col gap-1">
                  <Input
                    placeholder={t("building.creatorName")}
                    name="submitterName"
                    className="w-full"
                  />
                  <small className="text-gray-500">
                    {t("building.creatorDescription")}
                  </small>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit">{t("common.submit")}</Button>
                </div>
              </form>
            ) : (
              <span className="text-justify font-source-sans-3">
                {building.style}
              </span>
            )}
          </div>

          {building.famousResidents && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-brown">
                  {t("building.famousResidents")}
                </h3>
                {editingField !== "famousResidents" && data?.user && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingField("famousResidents")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t("building.suggestEdit")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {editingField === "famousResidents" ? (
                <form className="flex flex-col gap-2" action={submitSuggestion}>
                  <input type="hidden" name="field" value="famousResidents" />
                  <input type="hidden" name="buildingId" value={building.id} />
                  <Textarea
                    name="content"
                    defaultValue={building.famousResidents}
                    className="min-h-[100px]"
                  />
                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder={t("building.creatorName")}
                      name="submitterName"
                      className="w-full"
                    />
                    <small className="text-gray-500">
                      {t("building.creatorDescription")}
                    </small>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingField(null)}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit">{t("common.submit")}</Button>
                  </div>
                </form>
              ) : (
                <span className="text-justify font-source-sans-3">
                  {building.famousResidents}
                </span>
              )}
            </div>
          )}

          {building.renovation && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-brown">
                  {t("building.renovation")}
                </h3>
                {editingField !== "renovation" && data?.user && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingField("renovation")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t("building.suggestEdit")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {editingField === "renovation" ? (
                <form className="flex flex-col gap-2" action={submitSuggestion}>
                  <input type="hidden" name="field" value="renovation" />
                  <input type="hidden" name="buildingId" value={building.id} />
                  <Textarea
                    name="content"
                    defaultValue={building.renovation}
                    className="min-h-[100px]"
                  />
                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder={t("building.creatorName")}
                      name="submitterName"
                      className="w-full"
                    />
                    <small className="text-gray-500">
                      {t("building.creatorDescription")}
                    </small>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingField(null)}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit">{t("common.submit")}</Button>
                  </div>
                </form>
              ) : (
                <span className="text-justify font-source-sans-3">
                  {building.renovation}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-brown">
                {t("building.presentDay")}
              </h3>
              {editingField !== "presentDay" && data?.user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingField("presentDay")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("building.suggestEdit")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {editingField === "presentDay" ? (
              <form className="flex flex-col gap-2" action={submitSuggestion}>
                <input type="hidden" name="field" value="presentDay" />
                <input type="hidden" name="buildingId" value={building.id} />
                <Textarea
                  name="content"
                  defaultValue={building.presentDay}
                  className="min-h-[100px]"
                />
                <div className="flex flex-col gap-1">
                  <Input
                    placeholder={t("building.creatorName")}
                    name="submitterName"
                    className="w-full"
                  />
                  <small className="text-gray-500">
                    {t("building.creatorDescription")}
                  </small>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingField(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit">{t("common.submit")}</Button>
                </div>
              </form>
            ) : (
              <span className="text-justify font-source-sans-3">
                {building.presentDay}
              </span>
            )}
          </div>

          {/* Sources Section */}
          {Array.isArray(building.source) && building.source.length > 0 && (
            <div className="mt-6 flex flex-col gap-2 border-t border-brown-200 pt-6">
              <h3 className="text-2xl font-bold text-brown">
                {t("building.sources")}
              </h3>
              <div className="space-y-4">
                {building.source.map((source: any, index: number) => (
                  <div
                    key={index}
                    className="bg-brown-50 rounded-md p-4 shadow-sm"
                  >
                    {source.sourceType === "book" && (
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {source.bookTitle}
                        </span>
                        <div className="text-sm text-gray-600">
                          <span className="italic">{t("building.by")}</span>{" "}
                          {source.bookAuthor}
                          {source.bookYear && <span> ({source.bookYear})</span>}
                          {source.bookPublisher && (
                            <span>, {source.bookPublisher}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {source.sourceType === "website" && (
                      <div className="flex flex-col">
                        <a
                          href={source.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source.websiteUrl}
                        </a>
                      </div>
                    )}

                    {source.sourceType === "other" && (
                      <div className="flex flex-col">
                        <span className="text-justify font-source-sans-3">
                          {source.otherSource}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credits Section */}
          {building.creatorName && (
            <div className="mt-6 flex flex-col gap-2 border-t border-brown-200 pt-6">
              <h3 className="text-2xl font-bold text-brown">
                {t("building.credits")}
              </h3>
              <div className="bg-brown-50 rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-brown-800">
                    {t("building.contributedBy")}:
                  </span>
                  <span className="font-medium">{building.creatorName}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
