import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ReactNode, useMemo } from "react";
import {
  BaseSection,
  getLevelPaddingClass,
} from "./section-navigation";

export type SectionTreeItem<T = unknown> = BaseSection & T;

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
            {renderSectionContent(section)}
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
            onValueChange={(value) =>
              onAccordionGroupChange(groupIds, value)
            }
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
                  <div className="text-base">
                    {renderSectionContent(section)}
                  </div>
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
    renderSectionContent,
    renderTriggerContent,
  ]);

  return <>{renderedSections}</>;
};

export default SectionTree;
