"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";

type GenerateResponse = {
  text?: string;
  provider?: string;
  model?: string;
  citations?: Array<{ url: string; title?: string }>;
  error?: string;
  details?: string;
};

export const AIGenerateModal: React.FC<{
  collection: string;
  docId: string | number;
  locale: string;
  fieldPath: string;
  disabled?: boolean;
  onReplace: (value: string) => void;
  onAppend: (value: string) => void;
}> = ({
  collection,
  docId,
  locale,
  fieldPath,
  disabled,
  onReplace,
  onAppend,
}) => {
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [citations, setCitations] = useState<Array<{
    url: string;
    title?: string;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  const run = async () => {
    setIsGenerating(true);
    setError(null);
    setResultText(null);
    setCitations(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection,
          docId,
          locale,
          fieldPath,
          additionalInstructions: additionalInstructions || undefined,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as GenerateResponse;
      if (!res.ok) {
        throw new Error(
          json?.error || json?.details || `AI request failed (${res.status})`,
        );
      }

      setResultText(json.text ?? null);
      setCitations(json.citations ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="ml-2 h-8 px-3 py-1"
        >
          Generate
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal container={portalContainer ?? undefined}>
        <DialogPrimitive.Overlay
          className="fixed inset-0"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(10, 10, 12, 0.98)",
          }}
        />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 flex flex-col overflow-hidden border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(56rem, calc(100vw - 2rem))",
            height: "min(48rem, 85vh)",
            maxHeight: "90vh",
            backgroundColor: "var(--theme-elevation-150, #222327)",
            border: "1px solid var(--theme-elevation-300, #2c2d31)",
            color: "var(--theme-text, #f4f4f5)",
            zIndex: 9999,
            borderRadius: "1.5rem",
          }}
        >
          {/* Header */}
          <div
            className="border-b transition-colors"
            style={{
              borderColor: "var(--theme-elevation-300, #2c2d31)",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <DialogPrimitive.Title className="text-xl font-semibold tracking-tight">
                AI Generate
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Draft content for{" "}
                <span className="rounded-sm bg-neutral-100 px-1 py-0.5 font-mono text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {fieldPath}
                </span>{" "}
                ({locale})
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              className="rounded-md opacity-70 transition-colors hover:bg-neutral-100 hover:opacity-100 dark:hover:bg-neutral-800/50"
              style={{
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <X style={{ width: "18px", height: "18px" }} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div
            className="overflow-y-auto"
            style={{
              backgroundColor: "var(--theme-elevation-100, #16171a)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label className="text-sm font-medium">
                Additional instructions (optional)
              </label>
              <textarea
                className="w-full resize-y rounded-lg border border-neutral-300 bg-white p-3 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                style={{
                  minHeight: "80px",
                  backgroundColor: "var(--theme-elevation-50, #0f1012)",
                  borderColor: "var(--theme-elevation-300, #2c2d31)",
                  color: "var(--theme-text, #f4f4f5)",
                }}
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Keep it under 120 words. Mention current preservation status."
              />
            </div>

            <div>
              <Button
                type="button"
                disabled={isGenerating}
                onClick={() => void run()}
              >
                {isGenerating ? "Generating..." : "Generate Content"}
              </Button>
            </div>

            {error ? (
              <div
                className="rounded-md border border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-500"
                style={{ padding: "1rem" }}
              >
                <span className="mb-1 block font-semibold">Error</span>
                {error}
              </div>
            ) : null}

            {resultText ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  flex: 1,
                  marginTop: "0.5rem",
                }}
              >
                <label
                  className="text-sm font-medium"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Generated output
                  <span className="text-xs font-normal text-neutral-500">
                    {resultText.length} characters
                  </span>
                </label>
                <textarea
                  className="w-full resize-y rounded-lg border border-neutral-300 bg-white p-4 text-[15px] leading-relaxed transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                  style={{
                    minHeight: "350px",
                    flex: 1,
                    backgroundColor: "var(--theme-elevation-50, #0f1012)",
                    borderColor: "var(--theme-elevation-300, #2c2d31)",
                    color: "var(--theme-text, #f4f4f5)",
                  }}
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                />
              </div>
            ) : null}

            {citations?.length ? (
              <div
                className="rounded-lg border border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                style={{
                  marginTop: "0.5rem",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  backgroundColor: "var(--theme-elevation-50, #0f1012)",
                  borderColor: "var(--theme-elevation-300, #2c2d31)",
                }}
              >
                <p className="text-sm font-medium">Citations</p>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-neutral-700 dark:text-neutral-400">
                  {citations.map((c) => (
                    <li key={c.url}>
                      <a
                        className="transition-colors hover:text-blue-500 hover:underline dark:hover:text-blue-400"
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.title ?? c.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div
            className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
            style={{
              borderColor: "var(--theme-elevation-300, #2c2d31)",
              backgroundColor: "var(--theme-elevation-150, #222327)",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <p
              className="text-xs text-neutral-500 dark:text-neutral-400"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-20"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500/70"></span>
              </span>
              AI may be inaccurate; verify facts.
            </p>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Button
                type="button"
                variant="outline"
                disabled={!resultText}
                onClick={() => {
                  if (!resultText) return;
                  void navigator.clipboard
                    ?.writeText(resultText)
                    .catch(() => null);
                }}
              >
                Copy
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!resultText}
                onClick={() => {
                  if (!resultText) return;
                  onAppend(resultText);
                  setOpen(false);
                }}
              >
                Append
              </Button>
              <Button
                type="button"
                disabled={!resultText}
                onClick={() => {
                  if (!resultText) return;
                  onReplace(resultText);
                  setOpen(false);
                }}
              >
                Replace
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
