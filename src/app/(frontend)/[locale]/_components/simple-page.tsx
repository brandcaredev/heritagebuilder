"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import dynamic from "next/dynamic";
import { Building } from "payload-types";
import RichText from "./richtext";

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
  const BuildingsMap = dynamic(() => import("./buildings-map"), {
    loading: () => (
      <Skeleton
        className={cn(
          "rounded-lg",
          description ? "h-[400px] w-full lg:w-1/2" : "h-[400px] w-full",
        )}
      />
    ),
    ssr: false,
  });

  return (
    <>
      <h1 className="text-brown-800 text-4xl font-bold">{name}</h1>
      <div className="flex h-fit flex-col gap-4 lg:flex-row">
        {description && (
          <div
            className={cn(
              "flex justify-center px-6",
              position ? "w-full lg:w-1/2" : "w-full",
            )}
          >
            <RichText
              className="mt-6 text-brown-700"
              data={description}
              enableGutter={false}
            />
          </div>
        )}
        {position && (
          <BuildingsMap
            center={position}
            zoom={9}
            className={cn(
              "rounded-lg",
              description ? "h-[400px] w-full lg:w-1/2" : "h-[400px] w-full",
            )}
            buildings={buildings}
          />
        )}
      </div>
    </>
  );
};
export default SimplePage;
