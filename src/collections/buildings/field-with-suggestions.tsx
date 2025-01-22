"use client";
import {
  Collapsible,
  TextField,
  TextareaField,
  useDocumentInfo,
} from "@payloadcms/ui";
import { BuildingSuggestion } from "payload-types";
import React, { useEffect, useState } from "react";

const FieldWithSuggestions: React.FC<{
  path: string;
  fieldType: "text" | "textarea";
}> = ({ path, fieldType }) => {
  const { id } = useDocumentInfo();
  const [suggestions, setSuggestions] = useState<BuildingSuggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (id) {
        const response = await fetch(
          `/api/building-suggestions?where[building][equals]=${id}&where[field][equals]=${path}&where[status][equals]=pending`,
        );
        const data = await response.json();
        setSuggestions(data.docs);
      }
    };
    void fetchSuggestions();
  }, [id, path]);

  const markAsReviewed = async (suggestionId: number) => {
    await fetch(`/api/building-suggestions/${suggestionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status: "reviewed",
      }),
    });

    // Refresh suggestions
    const response = await fetch(
      `/api/building-suggestions?where[building][equals]=${id}&where[field][equals]=${path}&where[status][equals]=pending`,
    );
    const data = await response.json();
    setSuggestions(data.docs);
  };

  const FieldComponent = fieldType === "text" ? TextField : TextareaField;

  return (
    <div className={`field-type ${fieldType}`} id={`field-${path}`}>
      <label className="mb-2" htmlFor={`field-${path}`}>
        {path
          .replace(/([A-Z])/g, " $1") // Add space before capital letters
          .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
          .trim()}
      </label>

      <FieldComponent path={path} field={{ name: path }} />

      {suggestions.length > 0 && (
        <div className="suggestions-container">
          <Collapsible header={`Suggestions (${suggestions.length})`}>
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="suggestion-item border-b p-4">
                <div className="suggestion-content">
                  <div className="mt-2 p-6">{suggestion.suggestedContent}</div>
                  <div className="mt-4 flex items-center">
                    <div className="flex-1">
                      <button
                        className="w-40 rounded border border-black bg-white px-4 py-2 text-sm text-black hover:bg-gray-300"
                        onClick={() => markAsReviewed(suggestion.id)}
                      >
                        Mark as Reviewed
                      </button>
                    </div>
                    {suggestion.submitterName && (
                      <p className="text-sm text-white">
                        Suggested by: {suggestion.submitterName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Collapsible>
        </div>
      )}
    </div>
  );
};

export default FieldWithSuggestions;
