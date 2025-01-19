import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Media } from "payload-types";

export default function BuildingCard({ building }: { building: Building }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image
          src={(building.featuredImage as Media).url || "/placeholder.svg"}
          alt={building.name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <CardHeader>
        <CardTitle>{building.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{building.summary}</p>
      </CardContent>
    </Card>
  );
}
