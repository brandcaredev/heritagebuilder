import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Building, Media } from "payload-types";
import { cn, getURL } from "@/lib/utils";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { Tooltip } from "@/components/ui/tooltip";

export default function BuildingCard({
  building,
  loading,
}: {
  building: Building;
  loading?: boolean;
}) {
  return (
    <Card
      className={cn(
        "bg-brown-50 relative flex h-[300px] w-[300px] flex-col overflow-hidden shadow-2xl",
        loading &&
          "animate-pulse after:absolute after:inset-0 after:bg-white/50",
      )}
    >
      <div className="relative h-[180px]">
        <Image
          src={`${getURL()}${(building.featuredImage as Media).url}`}
          alt={building.name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="flex flex-col gap-1 px-2 py-1">
        <CardHeader className="flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-brown line-clamp-2 text-lg">
                  <h1>{building.name}</h1>
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent className="bg-brown-100 text-brown-900 z-20 rounded-md p-1">
                {building.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <p
            className={cn(
              "text-brown-900 line-clamp-4 overflow-hidden text-sm",
              building.name.length > 35 && "line-clamp-3",
            )}
          >
            {building.summary || building.history}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
