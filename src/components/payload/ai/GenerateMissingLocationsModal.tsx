"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  MissingLocationProposal,
  MissingLocationTarget,
} from "@/lib/ai/types";
import { useDocumentInfo, useField } from "@payloadcms/ui";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { RefreshCcw, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type GenerateMissingLocationsModalProps = {
  path?: string;
  field?: {
    name?: string;
  };
};

type PreviewItem = {
  id: string;
  proposal: MissingLocationProposal;
};

type PreviewResponse = {
  mode?: "preview";
  target?: MissingLocationTarget;
  proposals?: MissingLocationProposal[];
  warnings?: string[];
  skipped?: Array<{ reason: string; proposal?: Record<string, unknown> }>;
  existingSummary?: {
    countyCount?: number;
    cityCount?: number;
    buildingCount?: number;
  };
  debug?: {
    model?: string;
    selectionPrompt?: string;
    selectionRawModelOutput?: string;
    selectionRepairModelOutput?: string;
    selectedNames?: string[];
    descriptionPrompt?: string;
    descriptionRawModelOutput?: string;
    descriptionRepairModelOutput?: string;
  };
  error?: string;
  details?: string;
};

type CreateResponse = {
  mode?: "create";
  target?: MissingLocationTarget;
  createdCounties?: Array<{ id: string; name: { hu: string; en: string } }>;
  createdCities?: Array<{ id: string; name: { hu: string; en: string } }>;
  createdBuildings?: Array<{ id: string; name: { hu: string; en: string } }>;
  warnings?: string[];
  skipped?: Array<{ reason: string; proposal?: Record<string, unknown> }>;
  error?: string;
  details?: string;
};

const SHOULD_SHOW_AI_DEBUG = process.env.NODE_ENV === "development";

const normalizeReason = (reason: string): string =>
  reason
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const proposalKey = (
  proposal: MissingLocationProposal,
  index: number,
): string => {
  const nameKey = `${proposal.name.hu}-${proposal.name.en}`;
  return `${proposal.kind}-${nameKey}-${index}`;
};

const targetConfigByCollectionAndPath: Record<
  string,
  | {
      endpointPath: string;
      label: string;
      parentIdKey: "countryId" | "countyId" | "cityId";
      target: MissingLocationTarget;
    }
  | undefined
> = {
  "countries:relatedCounties": {
    target: "counties",
    label: "Counties",
    endpointPath: "/api/ai/generate-missing-counties",
    parentIdKey: "countryId",
  },
  "counties:relatedCities": {
    target: "cities",
    label: "Cities",
    endpointPath: "/api/ai/generate-missing-cities",
    parentIdKey: "countyId",
  },
  "cities:relatedBuildings": {
    target: "buildings",
    label: "Buildings",
    endpointPath: "/api/ai/generate-missing-buildings",
    parentIdKey: "cityId",
  },
};

const GenerateMissingLocationsModal: React.FC<
  GenerateMissingLocationsModalProps
> = (props) => {
  const { id, collectionSlug, data } = useDocumentInfo();
  const { path: contextPath } = useField({});
  const resolvedPath = contextPath || props.path || props.field?.name || "";
  const targetConfig =
    targetConfigByCollectionAndPath[`${collectionSlug}:${resolvedPath}`];
  const target = targetConfig?.target ?? null;
  const targetLabel = targetConfig?.label ?? "Items";

  const [open, setOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  const [count, setCount] = useState("3");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [warnings, setWarnings] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<
    Array<{ reason: string; proposal?: Record<string, unknown> }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [existingSummary, setExistingSummary] = useState<{
    countyCount?: number;
    cityCount?: number;
    buildingCount?: number;
  } | null>(null);
  const [createResponse, setCreateResponse] = useState<CreateResponse | null>(
    null,
  );
  const [debugInfo, setDebugInfo] = useState<PreviewResponse["debug"] | null>(
    null,
  );

  useEffect(() => {
    setHasMounted(true);
    setPortalContainer(document.body);
  }, []);

  const selectedCount = useMemo(
    () => previewItems.filter((item) => selectedIds.has(item.id)).length,
    [previewItems, selectedIds],
  );
  const parentStatus =
    data && typeof data === "object" && "_status" in data
      ? (data as { _status?: unknown })._status
      : undefined;
  const parentIsDraft = parentStatus === "draft";
  const draftParentMessage =
    "Publish this parent first. Missing child generation is disabled for draft parents.";

  const canShow = Boolean(id) && Boolean(targetConfig);

  if (!canShow || !targetConfig || !target || !hasMounted) return null;

  const resolvedTargetConfig = targetConfig;

  if (parentIsDraft) {
    return (
      <div className="mb-2 flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 py-1"
                  disabled
                >
                  Generate Missing {targetLabel}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{draftParentMessage}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  const toggleSelected = (idValue: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(idValue)) {
        next.delete(idValue);
      } else {
        next.add(idValue);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(previewItems.map((item) => item.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const runPreview = async () => {
    const parsedCount = Number(count);
    if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 5) {
      setError("Count must be an integer between 1 and 5.");
      return;
    }

    setIsPreviewing(true);
    setError(null);
    setCreateResponse(null);
    setDebugInfo(null);

    try {
      const response = await fetch(resolvedTargetConfig.endpointPath, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "preview",
          [resolvedTargetConfig.parentIdKey]: id,
          count: parsedCount,
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      const json = (await response.json().catch(() => ({}))) as PreviewResponse;
      if (!response.ok) {
        throw new Error(
          json.error ||
            json.details ||
            `AI request failed (${response.status})`,
        );
      }

      const proposals = Array.isArray(json.proposals) ? json.proposals : [];
      const items = proposals.map((proposal, index) => ({
        id: proposalKey(proposal, index),
        proposal,
      }));

      setPreviewItems(items);
      setSelectedIds(new Set(items.map((item) => item.id)));
      setWarnings(Array.isArray(json.warnings) ? json.warnings : []);
      setSkipped(Array.isArray(json.skipped) ? json.skipped : []);
      setDebugInfo(SHOULD_SHOW_AI_DEBUG ? (json.debug ?? null) : null);

      if (SHOULD_SHOW_AI_DEBUG && json.debug) {
        console.log("[GenerateMissingLocationsModal] AI preview debug", {
          endpointPath: resolvedTargetConfig.endpointPath,
          target: resolvedTargetConfig.target,
          debug: json.debug,
        });
      }

      setExistingSummary({
        countyCount:
          typeof json.existingSummary?.countyCount === "number"
            ? json.existingSummary.countyCount
            : undefined,
        cityCount:
          typeof json.existingSummary?.cityCount === "number"
            ? json.existingSummary.cityCount
            : undefined,
        buildingCount:
          typeof json.existingSummary?.buildingCount === "number"
            ? json.existingSummary.buildingCount
            : undefined,
      });
    } catch (requestError) {
      setPreviewItems([]);
      setSelectedIds(new Set());
      setDebugInfo(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Preview generation failed.",
      );
    } finally {
      setIsPreviewing(false);
    }
  };

  const runCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const selectedProposals = previewItems
        .filter((item) => selectedIds.has(item.id))
        .map((item) => item.proposal);

      if (selectedProposals.length === 0) {
        throw new Error("Select at least one proposal before creating drafts.");
      }

      const response = await fetch(resolvedTargetConfig.endpointPath, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "create",
          [resolvedTargetConfig.parentIdKey]: id,
          proposals: selectedProposals,
        }),
      });

      const json = (await response.json().catch(() => ({}))) as CreateResponse;

      if (!response.ok) {
        throw new Error(
          json.error ||
            json.details ||
            `Draft creation failed (${response.status})`,
        );
      }

      setCreateResponse(json);
      setWarnings(Array.isArray(json.warnings) ? json.warnings : []);
      setSkipped(Array.isArray(json.skipped) ? json.skipped : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Draft creation failed.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="mb-2 flex justify-end">
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 py-1"
            >
              Generate Missing {targetLabel}
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
                width: "min(60rem, calc(100vw - 2rem))",
                height: "min(50rem, 90vh)",
                backgroundColor: "var(--theme-elevation-150, #222327)",
                border: "1px solid var(--theme-elevation-300, #2c2d31)",
                color: "var(--theme-text, #f4f4f5)",
                zIndex: 9999,
                borderRadius: "1.5rem",
              }}
            >
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
                    Generate Missing {targetLabel}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    AI proposal workflow for direct child drafts in both
                    languages.
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

              <div
                className="overflow-y-auto"
                style={{
                  backgroundColor: "var(--theme-elevation-100, #16171a)",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  flex: 1,
                }}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      How many to generate (max 5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      value={count}
                      onChange={(event) => setCount(event.target.value)}
                      className="rounded-lg border px-3 py-2 text-sm"
                      style={{
                        backgroundColor: "var(--theme-elevation-50, #0f1012)",
                        borderColor: "var(--theme-elevation-300, #2c2d31)",
                        color: "var(--theme-text, #f4f4f5)",
                      }}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => void runPreview()}
                      disabled={isPreviewing}
                    >
                      {isPreviewing ? "Generating..." : "Generate Proposal"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Additional instructions (optional)
                  </label>
                  <textarea
                    value={additionalInstructions}
                    onChange={(event) =>
                      setAdditionalInstructions(event.target.value)
                    }
                    placeholder="e.g. prioritize culturally important entries first"
                    className="w-full resize-y rounded-lg border p-3 text-sm"
                    style={{
                      minHeight: "90px",
                      backgroundColor: "var(--theme-elevation-50, #0f1012)",
                      borderColor: "var(--theme-elevation-300, #2c2d31)",
                      color: "var(--theme-text, #f4f4f5)",
                    }}
                  />
                </div>

                {existingSummary ? (
                  <div
                    className="rounded-md border text-sm"
                    style={{
                      borderColor: "var(--theme-elevation-300, #2c2d31)",
                      padding: "0.75rem 1rem",
                      backgroundColor: "var(--theme-elevation-50, #0f1012)",
                    }}
                  >
                    Existing related drafts + published docs:{" "}
                    {target === "counties"
                      ? `${existingSummary.countyCount ?? 0} counties`
                      : null}
                    {target === "cities"
                      ? `${existingSummary.cityCount ?? 0} cities`
                      : null}
                    {target === "buildings"
                      ? `${existingSummary.buildingCount ?? 0} buildings`
                      : null}
                    .
                  </div>
                ) : null}

                {error ? (
                  <div
                    className="rounded-md border border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-500"
                    style={{ padding: "1rem" }}
                  >
                    <span className="mb-1 block font-semibold">Error</span>
                    {error}
                  </div>
                ) : null}

                {warnings.length > 0 ? (
                  <div
                    className="rounded-md border text-sm"
                    style={{
                      borderColor: "#6b7280",
                      padding: "0.75rem 1rem",
                      backgroundColor: "rgba(107, 114, 128, 0.12)",
                    }}
                  >
                    {warnings.map((warning, index) => (
                      <p key={`${warning}-${index}`}>{warning}</p>
                    ))}
                  </div>
                ) : null}

                {previewItems.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Review proposals ({selectedCount}/{previewItems.length}{" "}
                        selected)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAll}
                        >
                          Select all
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={deselectAll}
                        >
                          Deselect all
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {previewItems.map((item) => (
                        <label
                          key={item.id}
                          className="rounded-lg border p-3"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-50, #0f1012)",
                          }}
                        >
                          <div className="mb-2 flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleSelected(item.id)}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-sm font-semibold">
                                {item.proposal.kind === "county"
                                  ? "County"
                                  : item.proposal.kind === "city"
                                    ? "City"
                                    : "Building"}
                                : {item.proposal.name.hu} /{" "}
                                {item.proposal.name.en}
                              </p>
                            </div>
                          </div>

                          {item.proposal.kind === "building" ? (
                            <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                              <div className="md:col-span-2">
                                <p className="mb-1 font-semibold">
                                  Building type id
                                </p>
                                <p className="text-neutral-300">
                                  {item.proposal.buildingTypeId}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">HU summary</p>
                                <p className="text-neutral-300">
                                  {item.proposal.summary.hu}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">EN summary</p>
                                <p className="text-neutral-300">
                                  {item.proposal.summary.en}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">HU history</p>
                                <p className="text-neutral-300">
                                  {item.proposal.history.hu}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">EN history</p>
                                <p className="text-neutral-300">
                                  {item.proposal.history.en}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">HU style</p>
                                <p className="text-neutral-300">
                                  {item.proposal.style.hu}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">EN style</p>
                                <p className="text-neutral-300">
                                  {item.proposal.style.en}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">
                                  HU present day
                                </p>
                                <p className="text-neutral-300">
                                  {item.proposal.presentDay.hu}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">
                                  EN present day
                                </p>
                                <p className="text-neutral-300">
                                  {item.proposal.presentDay.en}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                              <div>
                                <p className="mb-1 font-semibold">
                                  HU description
                                </p>
                                <p className="text-neutral-300">
                                  {item.proposal.description.hu}
                                </p>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold">
                                  EN description
                                </p>
                                <p className="text-neutral-300">
                                  {item.proposal.description.en}
                                </p>
                              </div>
                            </div>
                          )}
                        </label>
                      ))}
                    </div>

                    <div>
                      <Button
                        type="button"
                        onClick={() => void runCreate()}
                        disabled={isCreating || selectedCount === 0}
                      >
                        {isCreating ? "Creating drafts..." : "Create Drafts"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {createResponse ? (
                  <div
                    className="rounded-md border text-sm"
                    style={{
                      borderColor: "#22c55e",
                      padding: "0.9rem 1rem",
                      backgroundColor: "rgba(34, 197, 94, 0.12)",
                    }}
                  >
                    <p>
                      Created counties:{" "}
                      {createResponse.createdCounties?.length ?? 0}, created
                      cities: {createResponse.createdCities?.length ?? 0},
                      created buildings:{" "}
                      {createResponse.createdBuildings?.length ?? 0}
                    </p>
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Refresh to load new drafts
                      </Button>
                    </div>
                  </div>
                ) : null}

                {skipped.length > 0 ? (
                  <div
                    className="rounded-md border text-sm"
                    style={{
                      borderColor: "#f59e0b",
                      padding: "0.9rem 1rem",
                      backgroundColor: "rgba(245, 158, 11, 0.14)",
                    }}
                  >
                    <p className="mb-1 font-semibold">Skipped items</p>
                    {skipped.slice(0, 15).map((item, index) => (
                      <p key={`${item.reason}-${index}`}>
                        {index + 1}. {normalizeReason(item.reason)}
                      </p>
                    ))}
                    {skipped.length > 15 ? (
                      <p>...and {skipped.length - 15} more</p>
                    ) : null}
                  </div>
                ) : null}

                {SHOULD_SHOW_AI_DEBUG && debugInfo ? (
                  <div
                    className="rounded-md border text-sm"
                    style={{
                      borderColor: "var(--theme-elevation-300, #2c2d31)",
                      padding: "0.9rem 1rem",
                      backgroundColor: "var(--theme-elevation-50, #0f1012)",
                    }}
                  >
                    <p className="mb-2 font-semibold">AI debug output</p>
                    {debugInfo.model ? (
                      <p className="mb-3 text-xs text-neutral-400">
                        Model: {debugInfo.model}
                      </p>
                    ) : null}

                    {debugInfo.selectionPrompt ? (
                      <div className="mb-3">
                        <p className="mb-1 font-semibold">Run 1 prompt</p>
                        <pre
                          className="overflow-x-auto rounded border p-3 text-xs whitespace-pre-wrap"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-100, #16171a)",
                          }}
                        >
                          {debugInfo.selectionPrompt}
                        </pre>
                      </div>
                    ) : null}

                    {debugInfo.selectionRawModelOutput ? (
                      <div className="mb-3">
                        <p className="mb-1 font-semibold">
                          Run 1 raw AI answer
                        </p>
                        <pre
                          className="overflow-x-auto rounded border p-3 text-xs whitespace-pre-wrap"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-100, #16171a)",
                          }}
                        >
                          {debugInfo.selectionRawModelOutput}
                        </pre>
                      </div>
                    ) : null}

                    {debugInfo.selectionRepairModelOutput ? (
                      <div className="mb-3">
                        <p className="mb-1 font-semibold">
                          Run 1 repair-pass AI answer
                        </p>
                        <pre
                          className="overflow-x-auto rounded border p-3 text-xs whitespace-pre-wrap"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-100, #16171a)",
                          }}
                        >
                          {debugInfo.selectionRepairModelOutput}
                        </pre>
                      </div>
                    ) : null}

                    {Array.isArray(debugInfo.selectedNames) &&
                    debugInfo.selectedNames.length > 0 ? (
                      <div className="mb-3">
                        <p className="mb-1 font-semibold">Selected names</p>
                        <pre
                          className="overflow-x-auto rounded border p-3 text-xs whitespace-pre-wrap"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-100, #16171a)",
                          }}
                        >
                          {JSON.stringify(debugInfo.selectedNames, null, 2)}
                        </pre>
                      </div>
                    ) : null}

                    {debugInfo.descriptionPrompt ? (
                      <div className="mb-3">
                        <p className="mb-1 font-semibold">Run 2 prompt</p>
                        <pre
                          className="overflow-x-auto rounded border p-3 text-xs whitespace-pre-wrap"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-100, #16171a)",
                          }}
                        >
                          {debugInfo.descriptionPrompt}
                        </pre>
                      </div>
                    ) : null}

                    {debugInfo.descriptionRawModelOutput ? (
                      <div className="mb-3">
                        <p className="mb-1 font-semibold">
                          Run 2 raw AI answer
                        </p>
                        <pre
                          className="overflow-x-auto rounded border p-3 text-xs whitespace-pre-wrap"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-100, #16171a)",
                          }}
                        >
                          {debugInfo.descriptionRawModelOutput}
                        </pre>
                      </div>
                    ) : null}

                    {debugInfo.descriptionRepairModelOutput ? (
                      <div>
                        <p className="mb-1 font-semibold">
                          Run 2 repair-pass AI answer
                        </p>
                        <pre
                          className="overflow-x-auto rounded border p-3 text-xs whitespace-pre-wrap"
                          style={{
                            borderColor: "var(--theme-elevation-300, #2c2d31)",
                            backgroundColor:
                              "var(--theme-elevation-100, #16171a)",
                          }}
                        >
                          {debugInfo.descriptionRepairModelOutput}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div
                className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                style={{
                  borderColor: "var(--theme-elevation-300, #2c2d31)",
                  backgroundColor: "var(--theme-elevation-150, #222327)",
                  padding: "1rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Only creates drafts. Verify facts before publishing.
                </p>
                <DialogPrimitive.Close asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogPrimitive.Close>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </>
  );
};

export default GenerateMissingLocationsModal;
