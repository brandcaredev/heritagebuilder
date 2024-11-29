"use client";
import {
  CastleIcon,
  ChurchIcon,
  CommonBuildingIcon,
  IndustrialIcon,
  ResidentalBuildingIcon,
} from "@/components/icons/leaflet-icons";
import { type RouterOutput } from "@/server/db/zodSchemaTypes";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L, { type MarkerCluster } from "leaflet";
import { createClient } from "@/supabase/client";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogTitle } from "@radix-ui/react-dialog";

type BuildingIcon = {
  name: string;
  history: string;
  featuredImage: string;
  slug: string;
  id: number;
};

const BuildingsMap = ({
  buildings,
}: {
  buildings: RouterOutput["building"]["getBuildings"];
}) => {
  const supabase = createClient();

  const [hoveredCluster, setHoveredCluster] = useState<BuildingIcon[] | null>(
    null,
  );
  console.log(hoveredCluster);
  const [dialogOpen, setDialogOpen] = useState(false);

  const SearchControl = () => {
    const map = useMapEvents({});

    useEffect(() => {
      const searchControl = new GeoSearchControl({
        provider: new OpenStreetMapProvider({
          params: {
            countrycodes: "RO,RS",
          },
        }),
        style: "bar",
        showMarker: false,
        retainZoomLevel: false,
      });
      map.addControl(searchControl);

      return () => {
        map.removeControl(searchControl);
      };
    }, [map]);

    return null;
  };

  const typeBasedIcon = useCallback((type: number) => {
    switch (type) {
      case 1:
        return ChurchIcon;
      case 2:
        return CastleIcon;
      case 4:
        return CommonBuildingIcon;
      case 5:
        return IndustrialIcon;
      case 6:
        return ResidentalBuildingIcon;
      default:
        return ChurchIcon;
    }
  }, []);

  const createClusterCustomIcon = function (cluster: MarkerCluster) {
    return L.divIcon({
      html: `<span>${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: L.point(50, 50, true),
    });
  };

  return (
    <>
      <MapContainer
        center={[45.9432, 24.9668]}
        zoom={7}
        //footer 248 padding 2*32 header 48
        style={{ height: "calc(100vh - 248px - 64px - 48px)", width: "100%" }}
        attributionControl={false}
        className="p-8"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <SearchControl />
        <MarkerClusterGroup
          iconCreateFunction={createClusterCustomIcon}
          chunkedLoading
          onClick={(e: any) => {
            setHoveredCluster((prev) =>
              prev
                ? null
                : (e.layer
                    .getAllChildMarkers()
                    //@ts-expect-error
                    .map((marker) => marker.options.data) as BuildingIcon[]),
            );
            setDialogOpen(true);
          }}
          zoomToBoundsOnClick={false}
        >
          {buildings.map((building) => {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("heritagebuilder-test")
              .getPublicUrl(building.featuredImage ?? "");

            return (
              <Marker
                key={building.id}
                position={[building.position![0], building.position![1]]}
                icon={typeBasedIcon(building.buildingtypeid!)}
                // @ts-expect-error
                data={{
                  name: building.name,
                  history: building.history,
                  featuredImage: building.featuredImage,
                  slug: building.slug,
                  id: building.id,
                }}
              >
                <Popup>
                  <Link
                    href={{
                      pathname: "/building/[slug]",
                      params: { slug: building.slug! },
                    }}
                    className="block w-[300px] no-underline"
                  >
                    <div className="overflow-hidden rounded-lg">
                      <div className="relative h-[200px] w-full">
                        <Image
                          src={publicUrl}
                          alt={building.name!}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-card p-2">
                        <h3 className="mb-1 text-xl font-semibold text-brown">
                          {building.name}
                        </h3>
                        <p className="text-muted-foreground line-clamp-4 text-sm text-green-dark-40">
                          {building.history}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          setHoveredCluster(null);
        }}
      >
        <DialogContent className="z-[9999] max-h-[50vh] w-96">
          <DialogTitle hidden>Selected buildings</DialogTitle>
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {hoveredCluster?.map((building) => {
                const {
                  data: { publicUrl },
                } = supabase.storage
                  .from("heritagebuilder-test")
                  .getPublicUrl(building.featuredImage ?? "");

                return (
                  <Link
                    key={building.id}
                    href={{
                      pathname: "/building/[slug]",
                      params: { slug: building.slug },
                    }}
                    className="hover:bg-accent flex items-center gap-3 rounded-md p-2"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={publicUrl}
                        alt={building.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <span className="text-nowrap font-playfair-display text-lg font-semibold text-brown">
                      {building.name.toUpperCase()}
                    </span>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuildingsMap;
