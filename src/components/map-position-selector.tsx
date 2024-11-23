import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect } from "react";
import { type LatLng } from "leaflet";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChurchIcon } from "./icons/leaflet-icons";
import { type LocaleType } from "@/lib/constans";

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
  setCounty,
  setCity,
}: {
  position: [number, number];
  setPosition: (value: [number, number]) => void;
  setCountry: (value: string) => void;
  setCounty: (value: string, lang: LocaleType) => void;
  setCity: (value: string, lang: LocaleType) => void;
}) => {
  const { mutate } = useMutation({ mutationFn: getPositionData });

  const SearchControl = () => {
    const map = useMapEvents({
      click(e) {
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
              setTimeout(() => {
                mutate(
                  { position: e.latlng, lang: "hu" },
                  {
                    onSuccess: (datahu) => {
                      setCity(data.address.city ?? data.address.village!, "en");
                      setCity(
                        datahu.address.city ?? datahu.address.village!,
                        "hu",
                      );
                      setCounty(data.address.county, "en");
                      setCounty(datahu.address.county, "hu");
                      setCountry(data.address.country_code);
                      setPosition([e.latlng.lat, e.latlng.lng]);
                    },
                  },
                );
              }, 100);
            },
          },
        );
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
      {position && <Marker position={position} icon={ChurchIcon} />}
    </MapContainer>
  );
};

export default MapPositionSelector;
