"use client";
import { useMutation } from "@tanstack/react-query";
import { type LatLng } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useCallback, useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { toast } from "sonner";
import {
  CastleIcon,
  ChurchIcon,
  CommonBuildingIcon,
  FortressIcon,
  IndustrialIcon,
  MapPinIcon,
  ResidentalBuildingIcon,
} from "./icons/leaflet-icons";

type LocationData = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon: string;
  address: {
    city?: string;
    village?: string;
    state_district: string;
    state?: string;
    county: string;
    ISO3166_2_lvl4: string;
    postcode: string;
    country: string;
    country_code: string;
  };
  extratags: {
    capital: string;
    website: string;
    wikidata: string;
    wikipedia: string;
    population: string;
  };
};

const getPositionData = async ({
  position,
  lang,
}: {
  position: LatLng;
  lang?: "hu" | "en";
}) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&accept-language=${lang}&addressdetails=1`,
  );
  const data = (await response.json()) as LocationData;
  return data;
};

const MapPositionSelector = ({
  position,
  setPosition,
  setCountry,
  type,
}: {
  position?: [number, number];
  setPosition: (value: [number, number]) => void;
  setCountry?: (value: string) => void;
  type?: number;
}) => {
  const { mutate } = useMutation({ mutationFn: getPositionData });
  const SearchControl = () => {
    const map = useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        if (setCountry) {
          mutate(
            { position: e.latlng, lang: "en" },
            {
              onSuccess: (data) => {
                if (
                  data.address.country_code !== "ro" &&
                  data.address.country_code !== "rs"
                ) {
                  toast.error(
                    "Invalid location, please select a location in Romania or Serbia",
                  );
                  return;
                }
                setCountry(data.address.country_code);
              },
            },
          );
        }
      },
    });

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

  const typeBasedIcon = useCallback(() => {
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
  }, [type]);

  return (
    <MapContainer
      center={[45.9432, 24.9668]}
      zoom={7}
      style={{ height: "500px", width: "100%" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        // attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <SearchControl />
      {position && <Marker position={position} icon={typeBasedIcon()} />}
    </MapContainer>
  );
};

export default MapPositionSelector;
