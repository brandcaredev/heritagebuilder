"use client";
import React from "react";
import { AdminViewProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

const CustomEditView: React.FC<AdminViewProps> = ({
  initPageResult,
  params,
  searchParams,
}) => {
  useUnsavedChangesWarning();
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    />
  );
};
export default CustomEditView;
