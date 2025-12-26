import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { SerializedLexicalNode } from "lexical";
import { useTranslations } from "next-intl";
import { isValidElement, ReactNode, useMemo, useState } from "react";
import { BaseSection, getLevelPaddingClass } from "./section-navigation";

export type SectionTreeItem<T = unknown> = BaseSection & T;

const PREVIEW_WORD_LIMIT = 133;

const LEXICAL_BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "quote",
  "list",
  "listitem",
  "code",
  "table",
  "tablerow",
  "tablecell",
]);

const REACT_BLOCK_ELEMENT_TYPES = new Set([
  "article",
  "blockquote",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ol",
  "p",
  "pre",
  "section",
  "ul",
]);

const REACT_INTERACTIVE_ELEMENT_TYPES = new Set([
  "button",
  "form",
  "input",
  "option",
  "select",
  "textarea",
]);

const extractPlainTextFromLexicalNode = (
  node: SerializedLexicalNode,
  parts: string[],
) => {
  if ("text" in node && typeof node.text === "string") {
    parts.push(node.text);
    return;
  }

  if (node.type === "linebreak") {
    parts.push("\n");
    return;
  }

  if ("children" in node && Array.isArray(node.children)) {
    node.children.forEach((child) =>
      extractPlainTextFromLexicalNode(child as SerializedLexicalNode, parts),
    );

    if (LEXICAL_BLOCK_TYPES.has(node.type)) {
      parts.push("\n");
    }
  }
};

const extractPlainTextFromLexicalNodes = (nodes: SerializedLexicalNode[]) => {
  const parts: string[] = [];

  nodes.forEach((node) => {
    extractPlainTextFromLexicalNode(node, parts);
    parts.push("\n");
  });

  return parts.join("").replace(/\s+/g, " ").trim();
};

const truncateToWordCount = (text: string, maxWords: number) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return { text: "", truncated: false };
  }

  const words = normalized.split(" ").filter(Boolean);
  if (words.length <= maxWords) {
    return { text: normalized, truncated: false };
  }

  return {
    text: words.slice(0, maxWords).join(" "),
    truncated: true,
  };
};

const hasLexicalNodes = <T,>(
  section: SectionTreeItem<T>,
): section is SectionTreeItem<T & { nodes: SerializedLexicalNode[] }> => {
  const candidate = section as SectionTreeItem<T & { nodes?: unknown }>;
  return (
    Array.isArray(candidate.nodes) &&
    candidate.nodes.every(
      (node) => node && typeof node === "object" && "type" in node,
    )
  );
};

const extractPlainTextFromReactNode = (
  node: ReactNode,
): { text: string; hasInteractiveElements: boolean } => {
  const parts: string[] = [];
  let hasInteractiveElements = false;

  const visit = (value: ReactNode) => {
    if (value == null || typeof value === "boolean") {
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      parts.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (isValidElement(value)) {
      const elementType = value.type;
      const props = value.props as { children?: ReactNode };

      if (typeof elementType === "string") {
        if (REACT_INTERACTIVE_ELEMENT_TYPES.has(elementType)) {
          hasInteractiveElements = true;
        }

        if (elementType === "br") {
          parts.push("\n");
          return;
        }
      }

      visit(props.children);

      if (typeof elementType === "string" && REACT_BLOCK_ELEMENT_TYPES.has(elementType)) {
        parts.push("\n");
      }

      return;
    }

    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
        "function"
    ) {
      Array.from(value as unknown as Iterable<ReactNode>).forEach(visit);
    }
  };

  visit(node);

  return {
    text: parts.join("").replace(/\s+/g, " ").trim(),
    hasInteractiveElements,
  };
};

type SectionTreeProps<T> = {
  onAccordionGroupChange: (
    groupIds: string[],
    value: string | string[],
  ) => void;
  onSectionInteraction: (sectionId: string) => void;
  openSections: string[];
  renderSectionContent: (section: SectionTreeItem<T>) => ReactNode;
  renderTriggerContent?: (section: SectionTreeItem<T>) => ReactNode;
  sections: SectionTreeItem<T>[];
};

const SectionTree = <T,>({
  onAccordionGroupChange,
  onSectionInteraction,
  openSections,
  renderSectionContent,
  renderTriggerContent,
  sections,
}: SectionTreeProps<T>) => {
  const t = useTranslations("common");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const childrenMap = useMemo(() => {
    const map = new Map<string | null, SectionTreeItem<T>[]>();
    sections.forEach((section) => {
      const key = section.parentId ?? null;
      const existing = map.get(key) ?? [];
      existing.push(section);
      map.set(key, existing);
    });
    return map;
  }, [sections]);

  const renderedSections = useMemo(() => {
    let accordionGroupIndex = 0;

    function renderSectionBody(section: SectionTreeItem<T>): ReactNode {
      if (hasLexicalNodes(section)) {
        const plainText = extractPlainTextFromLexicalNodes(section.nodes);
        const preview = truncateToWordCount(plainText, PREVIEW_WORD_LIMIT);

        if (!plainText || !preview.truncated) {
          return renderSectionContent(section);
        }

        if (expandedSections[section.id]) {
          return renderSectionContent(section);
        }

        return (
          <div className="space-y-2">
            <p className="font-source-sans-3 text-justify">{preview.text}</p>
            <button
              type="button"
              onClick={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  [section.id]: true,
                }))
              }
              className="text-green hover:text-green/80 inline-flex items-center text-sm font-medium underline underline-offset-4"
            >
              {t("readMore")}
            </button>
          </div>
        );
      }

      const fullContent = renderSectionContent(section);
      const extraction = extractPlainTextFromReactNode(fullContent);
      const plainText = extraction.text;
      if (extraction.hasInteractiveElements || !plainText) {
        return fullContent;
      }

      const preview = truncateToWordCount(plainText, PREVIEW_WORD_LIMIT);

      if (!plainText || !preview.truncated) {
        return fullContent;
      }

      if (expandedSections[section.id]) {
        return fullContent;
      }

      return (
        <div className="space-y-2">
          <p className="font-source-sans-3 text-justify">{preview.text}</p>
          <button
            type="button"
            onClick={() =>
              setExpandedSections((prev) => ({
                ...prev,
                [section.id]: true,
              }))
            }
            className="text-green hover:text-green/80 inline-flex items-center text-sm font-medium underline underline-offset-4"
          >
            {t("readMore")}
          </button>
        </div>
      );
    }

    function renderStaticSection(section: SectionTreeItem<T>): ReactNode {
      return (
        <div
          key={section.id}
          data-section={section.id}
          className="border-brown-100 rounded-lg border px-4 py-5"
        >
          <div className="font-playfair-display text-brown text-2xl">
            {section.title}
          </div>
          <div className="text-brown-700 mt-4 text-base">
            {renderSectionBody(section)}
          </div>
          {renderChildren(section.id)}
        </div>
      );
    }

    function renderChildren(parentId: string | null): ReactNode {
      const siblings = childrenMap.get(parentId) ?? [];
      if (!siblings.length) return null;

      const nodes: ReactNode[] = [];
      let currentAccordionItems: SectionTreeItem<T>[] = [];

      const flushAccordionGroup = () => {
        if (!currentAccordionItems.length) {
          return;
        }

        const groupIds = currentAccordionItems.map((section) => section.id);
        const groupKey = `accordion-group-${parentId ?? "root"}-${accordionGroupIndex}`;
        accordionGroupIndex += 1;

        nodes.push(
          <Accordion
            key={groupKey}
            type="multiple"
            value={openSections.filter((id) => groupIds.includes(id))}
            onValueChange={(value) => onAccordionGroupChange(groupIds, value)}
            className="rounded-lg"
          >
            {currentAccordionItems.map((section, index) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                data-section={section.id}
                className={cn(
                  "px-4",
                  index === currentAccordionItems.length - 1 && "border-b-0",
                )}
              >
                <AccordionTrigger
                  onClick={() => onSectionInteraction(section.id)}
                  className={cn(getLevelPaddingClass(section.level))}
                >
                  {renderTriggerContent ? (
                    renderTriggerContent(section)
                  ) : (
                    <span
                      className={cn(
                        "font-playfair-display text-brown text-2xl",
                        section.level >= 3 && "text-xl",
                        section.level >= 4 && "text-lg",
                      )}
                    >
                      {section.title}
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent className="text-brown-700 px-0 pb-6">
                  <div className="text-base">{renderSectionBody(section)}</div>
                  {renderChildren(section.id)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>,
        );

        currentAccordionItems = [];
      };

      siblings.forEach((section) => {
        if (section.level <= 1) {
          flushAccordionGroup();
          nodes.push(renderStaticSection(section));
          return;
        }

        currentAccordionItems.push(section);
      });

      flushAccordionGroup();

      return nodes;
    }

    return renderChildren(null);
  }, [
    childrenMap,
    onAccordionGroupChange,
    onSectionInteraction,
    openSections,
    expandedSections,
    renderSectionContent,
    renderTriggerContent,
    t,
  ]);

  return <>{renderedSections}</>;
};

export default SectionTree;
