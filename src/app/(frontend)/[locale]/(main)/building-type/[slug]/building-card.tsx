import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Building, Media } from "payload-types";
import { cn } from "@/lib/utils";
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
  loading: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative flex h-[300px] w-[300px] flex-col overflow-hidden",
        loading &&
          "animate-pulse after:absolute after:inset-0 after:bg-white/50",
      )}
    >
      <div className="relative h-[180px]">
        <Image
          src={(building.featuredImage as Media)?.url || "/placeholder.svg"}
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
                <CardTitle className="line-clamp-2 text-lg text-brown">
                  {building.name}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent className="z-20 rounded-md bg-brown-100 p-1 text-brown-900">
                {building.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <p
            className={cn(
              "line-clamp-4 overflow-hidden text-xs text-brown-900",
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
