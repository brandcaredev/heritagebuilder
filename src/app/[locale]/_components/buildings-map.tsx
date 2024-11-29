"use client";
import {
  CastleIcon,
  ChurchIcon,
  CommonBuildingIcon,
  IndustrialIcon,
  ResidentalBuildingIcon,
} from "@/components/icons/leaflet-icons";
import { Link } from "@/i18n/routing";
import { type RouterOutput } from "@/server/db/zodSchemaTypes";
import { createClient } from "@/supabase/client";
import L, { type MarkerCluster } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

const BuildingsMap = ({
  buildings,
}: {
  buildings: RouterOutput["building"]["getBuildings"];
}) => {
  const supabase = createClient();

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
    </>
  );
};

export default BuildingsMap;
