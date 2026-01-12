"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import dynamic from "next/dynamic";
import { Building } from "payload-types";
import { useMemo } from "react";
import type { SerializedElementNode, SerializedLexicalNode } from "lexical";
import { useTranslations } from "next-intl";
import SectionTree, { SectionTreeItem } from "./section-tree";
import { tocButtonClasses, useSectionNavigation } from "./section-navigation";
import RichText from "./richtext";

type SerializedHeadingNode = SerializedElementNode & {
  tag?: string;
  type: "heading";
};

type Section = SectionTreeItem<{
  nodes: SerializedLexicalNode[];
}>;

const isHeadingNode = (
  node: SerializedLexicalNode,
): node is SerializedHeadingNode => node.type === "heading";

const nodeTextContent = (node: SerializedLexicalNode): string => {
  if ("text" in node && typeof node.text === "string") {
    return node.text;
  }

  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(nodeTextContent).join("");
  }

  return "";
};

const slugifyHeading = (text: string, index: number) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || `section-${index}`;

const extractSections = (description?: SerializedEditorState | null) => {
  const introNodes: SerializedLexicalNode[] = [];
  const sections: Section[] = [];

  if (!description?.root?.children?.length) {
    return { introNodes, sections };
  }

  let currentSection: Section | null = null;

  const headingStack: Section[] = [];

  description.root.children.forEach((node, childIndex) => {
    if (isHeadingNode(node)) {
      const title = nodeTextContent(node).trim() || "Untitled section";
      const level = parseInt(node.tag?.replace("h", "") ?? "2", 10);
      const id = `${slugifyHeading(title, childIndex)}-${childIndex}`;

      while (
        headingStack.length > 0 &&
        headingStack[headingStack.length - 1]!.level >= level
      ) {
        headingStack.pop();
      }

      const parentId =
        headingStack.length > 0
          ? headingStack[headingStack.length - 1]!.id
          : null;

      currentSection = {
        id,
        level,
        parentId,
        nodes: [],
        title,
      };
      sections.push(currentSection);
      headingStack.push(currentSection);
      return;
    }

    if (!currentSection) {
      introNodes.push(node);
      return;
    }

    currentSection.nodes.push(node);
  });

  return { introNodes, sections };
};

const buildEditorStateSubset = (
  base: SerializedEditorState | null | undefined,
  nodes: SerializedLexicalNode[],
): SerializedEditorState => {
  if (base?.root) {
    return {
      ...base,
      root: {
        ...base.root,
        children: nodes,
      },
    };
  }

  return {
    root: {
      children: nodes,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
};

const SimplePage = ({
  name,
  description,
  buildings,
  position,
}: {
  name: string;
  description?: SerializedEditorState | null;
  buildings: Building[];
  position?: [number, number] | null;
}) => {
  const t = useTranslations("page.simplePage");
  const { introNodes, sections } = useMemo(
    () => extractSections(description),
    [description],
  );
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
    summaryId: introNodes.length ? "summary" : null,
  });

  const renderedSections = useMemo(
    () => (
      <SectionTree
        sections={sections}
        openSections={openSections}
        onAccordionGroupChange={handleAccordionGroupChange}
        onSectionInteraction={handleSectionInteraction}
        renderSectionContent={(section) => (
          <RichText
            className="text-brown-700"
            data={buildEditorStateSubset(description, section.nodes)}
            enableGutter={false}
          />
        )}
      />
    ),
    [
      description,
      handleAccordionGroupChange,
      handleSectionInteraction,
      openSections,
      sections,
    ],
  );

  const BuildingsMap = dynamic(() => import("./buildings-map"), {
    loading: () => <Skeleton className={cn("h-[400px] w-full rounded-lg")} />,
    ssr: false,
  });

  return (
    <>
      <h1 className="text-brown text-4xl font-bold">{name}</h1>
      <div className="mt-6 flex h-fit flex-col gap-8">
        {description && (
          <div className={cn("w-full px-0 sm:px-6")}>
            <div className="flex flex-col gap-8 lg:flex-row">
              {hasTableOfContents && (
                <aside className="hidden w-60 shrink-0 lg:block">
                  <div className="bg-white-2 sticky top-24 rounded-lg p-5 shadow-sm">
                    <p className="text-brown-700 text-xs font-semibold tracking-[0.2em] uppercase">
                      {t("contents")}
                    </p>
                    <nav className="mt-4 flex flex-col gap-2 text-sm">
                      {introNodes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleTocClick("summary")}
                          className={cn(
                            "text-brown-700 hover:text-green rounded-md px-2 py-1 text-left text-sm leading-6 font-medium transition-colors",
                            activeTocItem === "summary" && "text-green",
                          )}
                        >
                          {t("summary")}
                        </button>
                      )}
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
                      {position && (
                        <button
                          type="button"
                          onClick={() => handleTocClick("map")}
                          className={cn(
                            "text-brown-700 hover:text-green rounded-md py-1 text-left text-sm leading-6 font-medium transition-colors",
                            activeTocItem === "map" && "text-green",
                          )}
                        >
                          {t("map")}
                        </button>
                      )}
                    </nav>
                  </div>
                </aside>
              )}
              <div className="flex-1 space-y-6 sm:px-0" ref={containerRef}>
                {introNodes.length > 0 && (
                  <div
                    data-section="summary"
                    className="text-brown-700 rounded-lg p-6"
                  >
                    <RichText
                      className="text-brown-700"
                      data={buildEditorStateSubset(description, introNodes)}
                      enableGutter={false}
                    />
                  </div>
                )}
                {sections.length > 0 && renderedSections}
              </div>
            </div>
          </div>
        )}
        {position && (
          <div data-section="map">
            <BuildingsMap
              center={position}
              zoom={9}
              className={cn("h-[400px] w-full rounded-lg")}
              buildings={buildings}
            />
          </div>
        )}
      </div>
    </>
  );
};
export default SimplePage;
