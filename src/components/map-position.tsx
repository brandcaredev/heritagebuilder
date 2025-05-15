"use client";
import { useCallback } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import {
  CastleIcon,
  ChurchIcon,
  CommonBuildingIcon,
  FortressIcon,
  IndustrialIcon,
  MapPinIcon,
  ResidentalBuildingIcon,
} from "./icons/leaflet-icons";

const MapPosition = ({
  position,
  type,
  zoom,
  hidePosition,
  className,
}: {
  position: [number, number];
  type?: number;
  zoom?: number;
  hidePosition?: boolean;
  className?: string;
}) => {
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
    <div aria-disabled="true">
      <MapContainer
        center={position}
        zoom={zoom ?? 15}
        className={className}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          // attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {position && !hidePosition && (
          <Marker
            position={position}
            icon={typeBasedIcon()}
            eventHandlers={{
              click: () => {
                window.open(
                  `http://maps.google.com?q=${position[0]} ,${position[1]}`,
                  "_blank",
                );
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapPosition;
