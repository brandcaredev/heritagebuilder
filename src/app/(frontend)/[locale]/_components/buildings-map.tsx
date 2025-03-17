"use client";
import {
  CastleIcon,
  ChurchIcon,
  CommonBuildingIcon,
  FortressIcon,
  IndustrialIcon,
  MapPinIcon,
  ResidentalBuildingIcon,
} from "@/components/icons/leaflet-icons";
import { Link } from "@/i18n/routing";
import { getURL } from "@/lib/utils";
import L, { type MarkerCluster } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import Image from "next/image";
import type { Building, BuildingType, Media } from "payload-types";
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
  center,
  zoom,
  className,
}: {
  buildings: Building[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}) => {
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
      case 3:
        return FortressIcon;
      case 4:
        return CommonBuildingIcon;
      case 5:
        return IndustrialIcon;
      case 6:
        return ResidentalBuildingIcon;
      default:
        return MapPinIcon;
    }
  }, []);

  const createClusterCustomIcon = (cluster: MarkerCluster) =>
    L.divIcon({
      html: `<span>${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: L.point(50, 50, true),
    });

  return (
    <>
      <MapContainer
        center={center ?? [45.9432, 24.9668]}
        zoom={zoom ?? 7}
        attributionControl={false}
        className={className}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <SearchControl />
        <MarkerClusterGroup
          iconCreateFunction={createClusterCustomIcon}
          chunkedLoading
        >
          {buildings.map((building) => {
            return (
              <Marker
                key={building.id}
                position={[building.position[0], building.position[1]]}
                icon={typeBasedIcon((building.buildingType as BuildingType).id)}
              >
                <Popup>
                  <Link
                    href={{
                      pathname: "/building/[slug]",
                      params: { slug: building.slug },
                    }}
                    className="block w-[300px] rounded-lg bg-white-2 p-5 no-underline"
                  >
                    <div className="overflow-hidden">
                      <div className="relative h-[200px] w-full">
                        <Image
                          src={`${getURL()}${(building.featuredImage as Media).sizes?.card?.url}`}
                          alt={building.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-brown text-xl">
                          {building.name}
                        </h3>
                        <p className="line-clamp-5 text-brown-900 text-muted-foreground text-sm">
                          {building.summary || building.history}
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
