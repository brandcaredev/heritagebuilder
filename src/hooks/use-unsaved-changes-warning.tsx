import { useDocumentInfo } from "@payloadcms/ui";
import { useCallback, useEffect } from "react";

export const useUnsavedChangesWarning = (enabled: boolean = true) => {
  const modified = useDocumentInfo();

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (modified && enabled) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    },
    [modified, enabled],
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  return modified;
};
