import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Media } from "payload-types";

export default function BuildingCard({ building }: { building: Building }) {
  return (
    <Card className="flex h-[300px] w-[300px] flex-col gap-2 overflow-hidden">
      <div className="relative h-44">
        <Image
          src={(building.featuredImage as Media).url || "/placeholder.svg"}
          alt={building.name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="flex flex-col gap-3 px-2 pb-3">
        <CardHeader>
          <CardTitle className="text-lg text-brown">{building.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-brown-900 text-xs">
            {building.summary || building.history}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
