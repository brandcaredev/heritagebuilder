import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Building, Media } from "payload-types";
import { cn } from "@/lib/utils";

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
        "relative flex h-[300px] min-w-[250px] max-w-[300px] flex-col overflow-hidden",
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
      <div className="flex flex-1 flex-col px-2 pb-3">
        <CardHeader className="p-0 py-2">
          <CardTitle className="text-lg text-brown">
            Merciful Mountainpoint Church of Christ
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <p className="overflow-hidden text-xs text-brown-900">
            {building.summary || building.history}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
