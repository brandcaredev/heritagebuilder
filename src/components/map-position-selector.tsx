"use client";
import { useMutation } from "@tanstack/react-query";
import { type LatLng } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect, useState, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { toast } from "sonner";
import { MapPinIcon } from "./icons/leaflet-icons";
import { Input } from "./ui/input";
import L from "leaflet";
import { useTranslations } from "next-intl";

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
  error?: string;
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
}: {
  position?: [number, number];
  setPosition: (value: [number, number]) => void;
  setCountry?: (value: string) => void;
}) => {
  const t = useTranslations();
  const { mutate } = useMutation({ mutationFn: getPositionData });
  const [lat, setLat] = useState(position?.[0]?.toFixed(6) || "");
  const [lng, setLng] = useState(position?.[1]?.toFixed(6) || "");
  const mapRef = useRef<L.Map>(null);

  const handleCoordinateSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error(t("map.invalidCoordinates"));
      return;
    }

    // Create a synthetic event to simulate a map click
    const fakeEvent = {
      latlng: new L.LatLng(latNum, lngNum),
    };

    // Trigger the click handler manually
    if (mapRef.current) {
      mapRef.current.fireEvent("click", fakeEvent);
    }
  };

  const SearchControl = () => {
    const map = useMapEvents({
      click(e) {
        if (setCountry) {
          mutate(
            { position: e.latlng, lang: "en" },
            {
              onSuccess: (data) => {
                if (
                  data.error ||
                  (data.address.country_code !== "ro" &&
                    data.address.country_code !== "rs")
                ) {
                  toast.error(t("map.invalidCountry"));
                  return;
                }
                setCountry(data.address.country_code);
                setLat(e.latlng.lat.toFixed(6));
                setLng(e.latlng.lng.toFixed(6));
                setPosition([e.latlng.lat, e.latlng.lng]);
              },
            },
          );
        }
      },
    });

    // Store map reference
    if (mapRef.current !== map) {
      mapRef.current = map;
    }

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
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={t("map.latitude")}
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <Input
          type="text"
          placeholder={t("map.longitude")}
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
        <button
          onClick={handleCoordinateSubmit}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2"
        >
          {t("map.setCoordinates")}
        </button>
      </div>
      <div aria-disabled="true">
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
          {position && <Marker position={position} icon={MapPinIcon} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPositionSelector;
