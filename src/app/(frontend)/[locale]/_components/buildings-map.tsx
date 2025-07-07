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

// Define the SearchResult interface based on leaflet-geosearch documentation
type SearchResult = {
  x: number; // longitude
  y: number; // latitude
  label: string; // formatted address
  bounds: [[number, number], [number, number]] | null; // [[south, west], [north, east]]
  raw: any; // raw provider result
};

// Custom provider that combines building search with location search
class BuildingsAndLocationProvider extends OpenStreetMapProvider {
  private buildings: Building[];
  private locationProvider: OpenStreetMapProvider;

  constructor(options: { buildings: Building[]; params?: any }) {
    super({
      params: {
        countrycodes: "RO,RS,UA,SK",
        ...options.params,
      },
    });
    this.buildings = options.buildings;
    this.locationProvider = new OpenStreetMapProvider({
      params: {
        countrycodes: "RO,RS,UA,SK",
        ...options.params,
      },
    });
  }

  async search(options: { query: string }): Promise<SearchResult[]> {
    const { query } = options;
    const searchQuery = query.toLowerCase().trim();

    if (!searchQuery) return [];

    const results: SearchResult[] = [];
    console.log(this.buildings);
    // First, search buildings
    const buildingResults = this.buildings
      .filter((building) => {
        const name = building.name?.toLowerCase() || "";
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery.toLowerCase().includes(name.toLowerCase())
        );
      })
      .map((building) => ({
        x: building.position[1], // longitude
        y: building.position[0], // latitude
        label: `${building.name}${
          (building.buildingType as BuildingType).name
            ? `, ${(building.buildingType as BuildingType).name}`
            : ""
        }`,
        bounds: null,
        raw: building,
      }));

    results.push(...buildingResults);

    // Then search locations using a separate location provider
    try {
      const locationResults = await (this.locationProvider as any).search({
        query,
      });
      const locationResultsWithIcon = locationResults.map(
        (result: SearchResult) => ({
          ...result,
          label: `${result.label}`,
        }),
      );
      results.push(...locationResultsWithIcon);
    } catch (error) {
      console.warn("Location search failed:", error);
    }

    return results;
  }
}

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
        provider: new BuildingsAndLocationProvider({
          buildings,
          params: {
            countrycodes: "RO,RS,UA,SK",
          },
        }),
        style: "bar",
        showMarker: false,
        retainZoomLevel: false,
        searchLabel: "Search buildings and locations...",
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
      html: `<span aria-disabled="true">${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: L.point(50, 50, true),
    });

  return (
    <div aria-disabled="true" className={className}>
      <MapContainer
        center={center ?? [45.9432, 24.9668]}
        zoom={zoom ?? 7}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <SearchControl />
        <MarkerClusterGroup
          iconCreateFunction={createClusterCustomIcon}
          chunkedLoading
          showCoverageOnHover={false}
          removeOutsideVisibleBounds={false}
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
                        <h3 className="mb-1 text-xl font-semibold text-brown">
                          {building.name}
                        </h3>
                        <p className="text-muted-foreground line-clamp-5 text-sm text-brown-900">
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
    </div>
  );
};

export default BuildingsMap;
