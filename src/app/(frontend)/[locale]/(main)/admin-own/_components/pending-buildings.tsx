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
import EditBuildingForm from "@/app/(frontend)/locale/_components/edit-building";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function PendingBuildings({
  pendingBuildings,
  buildingTypes,
}: {
  pendingBuildings: RouterOutput["building"]["getPendingBuildings"];
  buildingTypes: BuildingTypes[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const [selectedBuilding, setSelectedBuilding] = useState<
    RouterOutput["building"]["getPendingBuildings"][0] | null
  >(null);
  const { mutate: approveBuilding } = api.building.approveBuilding.useMutation({
    onSuccess: () => {
      toast.success(t("admin.pending.acceptSuccess"), {
        id: "building-approve-toast",
      });
      router.refresh();
    },
    onError: () => {
      toast.error(t("admin.youtube.error"), {
        id: "building-approve-toast",
      });
    },
  });

  if (!pendingBuildings || pendingBuildings.length === 0) {
    return <div>{t("admin.pending.noBuildings")}</div>;
  }

  if (selectedBuilding) {
    return (
      <div>
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setSelectedBuilding(null)}
        >
          {t("common.back")}
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
            creatorname: selectedBuilding.creatorname,
            creatoremail: selectedBuilding.creatoremail,
            en: selectedBuilding.en,
            hu: selectedBuilding.hu,
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">
        {t("admin.pending.title")}
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("form.name")}</TableHead>
            <TableHead>{t("form.country")}</TableHead>
            <TableHead>{t("form.county")}</TableHead>
            <TableHead>{t("form.city")}</TableHead>
            <TableHead>{t("form.type")}</TableHead>
            <TableHead>{t("admin.youtube.actions")}</TableHead>
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
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.loading("Building approveing...", {
                        id: "building-approve-toast",
                      });
                      approveBuilding({ id: building.id });
                    }}
                  >
                    {t("admin.pending.accept")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement reject functionality
                    }}
                  >
                    {t("admin.pending.reject")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
