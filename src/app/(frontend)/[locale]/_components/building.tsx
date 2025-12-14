"use client";
import { Button, Input, Textarea } from "@/components/ui";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import GalleryWithDialog from "./image-gallery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/auth";
import SectionTree, { SectionTreeItem } from "./section-tree";
import {
  tocButtonClasses,
  useSectionNavigation,
} from "./section-navigation";
import { cn } from "@/lib/utils";

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

type EditableSectionField = Exclude<EditableFields, "name" | null>;

type BuildingSection = SectionTreeItem<{
  field?: EditableSectionField;
  renderType?: "sources" | "credits";
}>;

export default function BuildingComponent({
  building,
  buildingImages,
}: {
  building: Building;
  buildingImages: string[];
}) {
  const t = useTranslations();
  const pageT = useTranslations("page.simplePage");
  const [editingField, setEditingField] = useState<EditableFields>(null);

  const { data } = useQuery({
    queryFn: async () => (await supabase.auth.getUser()).data,
    queryKey: ["user"],
    staleTime: 0,
  });
  const isLoggedIn = Boolean(data?.user);

  const getFieldValue = (field: EditableSectionField) =>
    building[field as keyof Building] as string | null | undefined;

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
    } catch {
      toast.error("Failed to submit suggestion");
    }
  };

  const sections = useMemo<BuildingSection[]>(() => {
    const items: BuildingSection[] = [
      {
        id: "history",
        level: 2,
        parentId: null,
        title: t("building.history"),
        field: "history",
      },
      {
        id: "style",
        level: 2,
        parentId: null,
        title: t("building.style"),
        field: "style",
      },
    ];

    if (building.famousResidents) {
      items.push({
        id: "famous-residents",
        level: 2,
        parentId: null,
        title: t("building.famousResidents"),
        field: "famousResidents",
      });
    }

    if (building.renovation) {
      items.push({
        id: "renovation",
        level: 2,
        parentId: null,
        title: t("building.renovation"),
        field: "renovation",
      });
    }

    items.push({
      id: "present-day",
      level: 2,
      parentId: null,
      title: t("building.presentDay"),
      field: "presentDay",
    });

    if (Array.isArray(building.source) && building.source.length > 0) {
      items.push({
        id: "sources",
        level: 2,
        parentId: null,
        title: t("building.sources"),
        renderType: "sources",
      });
    }

    if (building.creatorName) {
      items.push({
        id: "credits",
        level: 2,
        parentId: null,
        title: t("building.credits"),
        renderType: "credits",
      });
    }

    return items;
  }, [building, t]);

  const {
    activeTocItem,
    containerRef,
    handleAccordionGroupChange,
    handleSectionInteraction,
    handleTocClick,
    hasTableOfContents,
    openSections,
  } = useSectionNavigation({
    sections,
  });

  const renderEditableSection = (field: EditableSectionField) => {
    const value = getFieldValue(field) ?? "";

    if (editingField === field) {
      return (
        <form className="flex flex-col gap-2" action={submitSuggestion}>
          <input type="hidden" name="field" value={field} />
          <input type="hidden" name="buildingId" value={building.id} />
          <Textarea
            name="content"
            defaultValue={value}
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
            <Button variant="outline" onClick={() => setEditingField(null)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.submit")}</Button>
          </div>
        </form>
      );
    }

    return (
      <span className="font-source-sans-3 whitespace-pre-line text-justify">
        {value}
      </span>
    );
  };

  const renderSourcesSection = () => {
    if (!Array.isArray(building.source) || building.source.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        {building.source.map((source: any, index: number) => (
          <div
            key={index}
            className="bg-brown-50 rounded-md p-4 shadow-sm"
          >
            {source.sourceType === "book" && (
              <div className="flex flex-col">
                <span className="font-semibold">{source.bookTitle}</span>
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
                <span className="font-source-sans-3 text-justify">
                  {source.otherSource}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCreditsSection = () => {
    if (!building.creatorName) {
      return null;
    }

    return (
      <div className="bg-brown-50 rounded-md p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-brown-800">
            {t("building.contributedBy")}:
          </span>
          <span className="font-medium">{building.creatorName}</span>
        </div>
      </div>
    );
  };

  const renderSectionContent = (section: BuildingSection) => {
    if (section.field) {
      return renderEditableSection(section.field);
    }

    if (section.renderType === "sources") {
      return renderSourcesSection();
    }

    if (section.renderType === "credits") {
      return renderCreditsSection();
    }

    return null;
  };

  const renderTriggerContent = (section: BuildingSection) => (
    <div className="flex w-full items-center justify-between gap-4">
      <span
        className={cn(
          "font-playfair-display text-brown text-2xl",
          section.level >= 3 && "text-xl",
          section.level >= 4 && "text-lg",
        )}
      >
        {section.title}
      </span>
      {section.field && isLoggedIn && editingField !== section.field && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingField(section.field ?? null)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("building.suggestEdit")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {editingField === "name" ? (
            <form className="flex w-full flex-col gap-2" action={submitSuggestion}>
              <input type="hidden" name="field" value="name" />
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
                <Button variant="outline" onClick={() => setEditingField(null)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("common.submit")}</Button>
              </div>
            </form>
          ) : (
            <h1 className="text-brown text-4xl font-bold">{building.name}</h1>
          )}
          {editingField !== "name" && isLoggedIn && (
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
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {hasTableOfContents && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="bg-white-2 sticky top-24 rounded-lg p-5 shadow-sm">
              <p className="text-brown-700 text-xs font-semibold tracking-[0.2em] uppercase">
                {pageT("contents")}
              </p>
              <nav className="mt-4 flex flex-col gap-2 text-sm">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleTocClick(section.id)}
                    className={tocButtonClasses(
                      activeTocItem === section.id,
                      section.level,
                    )}
                  >
                    {section.title}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleTocClick("map")}
                  className={cn(
                    "text-brown-700 hover:text-green rounded-md py-1 text-left text-sm leading-6 font-medium transition-colors",
                    activeTocItem === "map" && "text-green",
                  )}
                >
                  {pageT("map")}
                </button>
              </nav>
            </div>
          </aside>
        )}
        <div className="flex-1 space-y-6" ref={containerRef}>
          <SectionTree
            sections={sections}
            openSections={openSections}
            onAccordionGroupChange={handleAccordionGroupChange}
            onSectionInteraction={handleSectionInteraction}
            renderSectionContent={renderSectionContent}
            renderTriggerContent={renderTriggerContent}
          />
        </div>
        <div className="flex flex-col gap-4 lg:w-[360px]">
          <div data-section="gallery" className="rounded-lg">
            <GalleryWithDialog images={buildingImages} />
          </div>
          <div data-section="map">
            <MapPosition
              position={building.position}
              type={(building.buildingType as BuildingType).id}
              className="h-[400px] w-full md:h-[600px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
