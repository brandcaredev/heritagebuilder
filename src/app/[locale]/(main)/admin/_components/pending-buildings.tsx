"use client";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  type BuildingTypes,
  type RouterOutput,
} from "@/server/db/zodSchemaTypes";
import { useRouter } from "@/i18n/routing";
import EditBuildingForm from "@/app/[locale]/_components/edit-building";
import { useState } from "react";
import { toast } from "sonner";

export default function PendingBuildings({
  pendingBuildings,
  buildingTypes,
}: {
  pendingBuildings: RouterOutput["building"]["getPendingBuildings"];
  buildingTypes: BuildingTypes[];
}) {
  const router = useRouter();
  const [selectedBuilding, setSelectedBuilding] = useState<
    RouterOutput["building"]["getPendingBuildings"][0] | null
  >(null);
  const { mutate: approveBuilding } = api.building.approveBuilding.useMutation({
    onSuccess: () => {
      toast.success("Building approved successfully", {
        id: "building-approve-toast",
      });
      router.refresh();
    },
    onError: () => {
      toast.error("Something went wrong while approving the building", {
        id: "building-approve-toast",
      });
    },
  });

  if (!pendingBuildings || pendingBuildings.length === 0) {
    return <div>No pending buildings found</div>;
  }

  if (selectedBuilding) {
    return (
      <div>
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setSelectedBuilding(null)}
        >
          Back to List
        </Button>
        <EditBuildingForm
          buildingTypes={buildingTypes}
          building={{
            id: selectedBuilding.id,
            featuredImage: selectedBuilding.featuredImage,
            images: selectedBuilding.images,
            countryid: selectedBuilding.countryid,
            countyid: selectedBuilding.countyid,
            cityid: selectedBuilding.cityid,
            buildingtypeid: selectedBuilding.buildingtypeid,
            position: selectedBuilding.position,
            en: selectedBuilding.en,
            hu: selectedBuilding.hu,
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Pending Buildings</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>County</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingBuildings.map((building) => (
            <TableRow
              key={building.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => setSelectedBuilding(building)}
            >
              <TableCell>{building.hu.name}</TableCell>
              <TableCell>{building.country.hu.name}</TableCell>
              <TableCell>{building.county.hu.name}</TableCell>
              <TableCell>{building.city.hu.name}</TableCell>
              <TableCell>{building.buildingType.hu.name}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.loading("Building approveing...", {
                      id: "building-approve-toast",
                    });
                    approveBuilding({ id: building.id });
                  }}
                >
                  Approve
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
