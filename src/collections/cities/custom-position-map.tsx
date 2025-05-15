import { MapPinIcon } from "@/components/icons/leaflet-icons";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
const CustomPositionMap = ({
  value,
  setValue,
}: {
  value?: [number, number];
  setValue: (val: [number, number], disableModifyingForm?: boolean) => void;
}) => {
  const SearchControl = () => {
    const map = useMapEvents({
      click(e) {
        setValue([e.latlng.lat, e.latlng.lng]);
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
    <div aria-disabled="true">
      <MapContainer
        center={value ?? [45.9432, 24.9668]}
        zoom={7}
        style={{ height: "200px", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          // attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <SearchControl />
        {value && <Marker position={value} icon={MapPinIcon} />}
      </MapContainer>
    </div>
  );
};

export default CustomPositionMap;
