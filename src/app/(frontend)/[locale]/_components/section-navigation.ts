import { cn } from "@/lib/utils";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type BaseSection = {
  id: string;
  level: number;
  parentId: string | null;
  title: string;
};

export const getLevelPaddingClass = (level: number) => {
  if (level <= 2) return "pl-0";
  if (level === 3) return "pl-4";
  if (level === 4) return "pl-6";
  return "pl-8";
};

export const getLevelTextClass = (level: number) =>
  level <= 2 ? "" : "text-xs text-brown-600";

type UseSectionNavigationOptions = {
  sections: BaseSection[];
  summaryId?: string | null;
  defaultActiveId?: string | null;
};

type UseSectionNavigationResult = {
  activeTocItem: string | null;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  handleAccordionGroupChange: (
    groupIds: string[],
    value: string | string[],
  ) => void;
  handleSectionInteraction: (sectionId: string) => void;
  handleTocClick: (targetId: string) => void;
  hasTableOfContents: boolean;
  openSections: string[];
};

export const useSectionNavigation = ({
  sections,
  summaryId,
  defaultActiveId,
}: UseSectionNavigationOptions): UseSectionNavigationResult => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sectionMap = useMemo(() => {
    const map = new Map<string, BaseSection>();
    sections.forEach((section) => map.set(section.id, section));
    return map;
  }, [sections]);

  const hasTableOfContents = Boolean(summaryId || sections.length);

  const initialActiveId = useMemo(() => {
    if (summaryId) return summaryId;
    if (sections.length > 0 && sections[0]) return sections[0].id;
    return defaultActiveId ?? null;
  }, [defaultActiveId, sections, summaryId]);

  const [openSections, setOpenSections] = useState<string[]>([]);
  const [activeTocItem, setActiveTocItem] = useState<string | null>(
    initialActiveId,
  );

  useEffect(() => {
    setActiveTocItem(initialActiveId);
  }, [initialActiveId]);

  const getSectionPath = useCallback(
    (sectionId: string) => {
      const path: string[] = [];
      let currentId: string | null = sectionId;

      while (currentId) {
        path.unshift(currentId);
        const nextParent: string | null =
          sectionMap.get(currentId)?.parentId ?? null;
        currentId = nextParent;
      }

      return path;
    },
    [sectionMap],
  );

  const getOpenablePath = useCallback(
    (sectionId: string) =>
      getSectionPath(sectionId).filter((id) => {
        const section = sectionMap.get(id);
        return Boolean(section && section.level > 1);
      }),
    [getSectionPath, sectionMap],
  );

  const normalizeOpenSections = useCallback(
    (values: string[]) => {
      const uniqueValues = Array.from(new Set(values));
      const valuesSet = new Set(uniqueValues);

      return uniqueValues.filter((id) => {
        const section = sectionMap.get(id);
        if (!section || section.level <= 1) {
          return false;
        }

        let parentId = section.parentId;
        while (parentId) {
          const parentSection = sectionMap.get(parentId);
          if (
            parentSection &&
            parentSection.level > 1 &&
            !valuesSet.has(parentId)
          ) {
            return false;
          }
          parentId = parentSection?.parentId ?? null;
        }

        return true;
      });
    },
    [sectionMap],
  );

  const setControlledOpenSections = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      setOpenSections((previous) => {
        const value = typeof next === "function" ? next(previous) : next;
        const normalized = normalizeOpenSections(value);
        if (normalized.length) {
          setActiveTocItem(normalized[normalized.length - 1] || null);
        } else if (summaryId) {
          setActiveTocItem(summaryId);
        } else if (sections.length > 0 && sections[0]) {
          setActiveTocItem(sections[0].id);
        } else if (defaultActiveId) {
          setActiveTocItem(defaultActiveId);
        } else {
          setActiveTocItem(null);
        }
        return normalized;
      });
    },
    [defaultActiveId, normalizeOpenSections, sections, summaryId],
  );

  const ensureSectionPathOpen = useCallback(
    (sectionId: string) => {
      const path = getOpenablePath(sectionId);
      if (!path.length) {
        return;
      }

      setControlledOpenSections((previous) => [...previous, ...path]);
    },
    [getOpenablePath, setControlledOpenSections],
  );

  useEffect(() => {
    if (!sections.length) {
      setControlledOpenSections([]);
      setActiveTocItem(summaryId ?? defaultActiveId ?? null);
      return;
    }

    const allAccordionSections = sections
      .filter((section) => section.level > 1)
      .map((section) => section.id);
    setControlledOpenSections(allAccordionSections);
  }, [defaultActiveId, sections, setControlledOpenSections, summaryId]);

  const handleScrollToSection = useCallback((sectionId: string) => {
    const containerEl = containerRef.current;
    const sectionEl =
      containerEl?.querySelector(`[data-section="${sectionId}"]`) ??
      (typeof document !== "undefined"
        ? document.querySelector(`[data-section="${sectionId}"]`)
        : null);

    if (!sectionEl) return;

    sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTocClick = useCallback(
    (targetId: string) => {
      ensureSectionPathOpen(targetId);
      setActiveTocItem(targetId);
      handleScrollToSection(targetId);
    },
    [ensureSectionPathOpen, handleScrollToSection],
  );

  const handleSectionInteraction = useCallback((sectionId: string) => {
    setActiveTocItem(sectionId);
  }, []);

  const handleAccordionGroupChange = useCallback(
    (groupIds: string[], value: string | string[]) => {
      const nextValues = Array.isArray(value) ? value : value ? [value] : [];
      setControlledOpenSections((previous) => {
        const filtered = previous.filter((id) => !groupIds.includes(id));
        return [...filtered, ...nextValues];
      });
    },
    [setControlledOpenSections],
  );

  return {
    activeTocItem,
    containerRef,
    handleAccordionGroupChange,
    handleSectionInteraction,
    handleTocClick,
    hasTableOfContents,
    openSections,
  };
};

export const tocButtonClasses = (isActive: boolean, level: number) =>
  cn(
    "text-brown-700 hover:text-green rounded-md px-2 py-1 text-left text-sm leading-6 font-medium transition-colors",
    getLevelPaddingClass(level),
    getLevelTextClass(level),
    isActive && "text-green",
  );
