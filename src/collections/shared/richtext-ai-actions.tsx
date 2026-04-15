"use client";

import { AIGenerateModal } from "@/components/payload/ai/AIGenerateModal";
import { buildEditorState } from "@payloadcms/richtext-lexical/client";
import type { SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";
import { useDocumentInfo, useField, useFormFields, useLocale } from "@payloadcms/ui";
import React from "react";

type LexicalEditorStateLike = {
  root?: {
    children?: SerializedLexicalNode[];
  };
};

type RichTextAIActionsProps = {
  path?: string;
  field?: {
    name?: string;
  };
};

const getLocaleCode = (locale: unknown): string => {
  if (typeof locale === "string") return locale;

  if (
    locale &&
    typeof locale === "object" &&
    "code" in locale &&
    typeof (locale as { code?: unknown }).code === "string"
  ) {
    return (locale as { code?: string }).code ?? "";
  }

  return "";
};

const getLexicalNodes = (value: unknown): SerializedLexicalNode[] => {
  if (!value || typeof value !== "object") return [];

  const root = (value as LexicalEditorStateLike).root;
  if (!root || typeof root !== "object") return [];

  return Array.isArray(root.children) ? root.children : [];
};

const cloneNodes = (nodes: SerializedLexicalNode[]): SerializedLexicalNode[] => {
  if (nodes.length === 0) return [];

  try {
    if (typeof structuredClone === "function") return structuredClone(nodes);
    return JSON.parse(JSON.stringify(nodes)) as SerializedLexicalNode[];
  } catch {
    return [...nodes];
  }
};

const buildStateFromText = (text: string): LexicalEditorStateLike => {
  const trimmed = text.trim();
  if (!trimmed) return buildEditorState({ nodes: [] });
  return buildEditorState({ text: trimmed });
};

const appendGeneratedText = (
  existingValue: unknown,
  text: string,
): LexicalEditorStateLike => {
  const trimmed = text.trim();
  const existingNodes = cloneNodes(getLexicalNodes(existingValue));

  if (!trimmed) return buildEditorState({ nodes: existingNodes });

  const generatedNodes = cloneNodes(getLexicalNodes(buildEditorState({ text: trimmed })));
  return buildEditorState({ nodes: [...existingNodes, ...generatedNodes] });
};

const RichTextAIActions: React.FC<RichTextAIActionsProps> = (props) => {
  const { id, collectionSlug } = useDocumentInfo();
  const locale = useLocale();

  // Use field context path from Payload instead of forcing props.path.
  // This is important for localized fields where the internal form path can differ.
  const { path: contextPath, value, setValue } = useField({});
  const dispatchField = useFormFields(([_, dispatch]) => dispatch);
  const baseFieldPath = props.path || props.field?.name || contextPath || "";
  const resolvedPath = contextPath || baseFieldPath;

  const applyEditorState = React.useCallback(
    (nextState: LexicalEditorStateLike) => {
      setValue(nextState);

      // RichText Lexical only reacts to external form-state changes when initialValue updates too.
      // Keep initialValue in sync so editor content refreshes immediately after AI replace/append.
      if (resolvedPath) {
        dispatchField({
          type: "UPDATE",
          path: resolvedPath,
          initialValue: nextState,
        });
      }
    },
    [dispatchField, resolvedPath, setValue],
  );

  const localeCode = getLocaleCode(locale) || "hu";
  const showAI =
    Boolean(id) &&
    (collectionSlug === "cities" || collectionSlug === "counties") &&
    baseFieldPath === "description";

  if (!showAI) return null;

  return (
    <div className="mt-2 flex justify-end">
      <AIGenerateModal
        collection={collectionSlug}
        docId={id!}
        locale={localeCode}
        fieldPath={baseFieldPath}
        onReplace={(text) => applyEditorState(buildStateFromText(text))}
        onAppend={(text) => applyEditorState(appendGeneratedText(value, text))}
      />
    </div>
  );
};

export default RichTextAIActions;
