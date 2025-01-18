"use client";
import {
  Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
} from "@/components/carousel-bottom-thumbnails";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Building, BuildingType } from "payload-types";

const MapPosition = dynamic(() => import("@/components/map-position"), {
  ssr: false,
});

export default function BuildingComponent({
  building,
  buildingImages,
}: {
  building: Building;
  buildingImages: string[];
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex flex-col gap-4 lg:w-1/2">
        <Carousel>
          <CarouselMainContainer className="h-[400px] md:h-[600px]">
            {buildingImages.map((img, index) => (
              <SliderMainItem
                key={index}
                className="relative h-full w-full bg-transparent"
              >
                <Image
                  src={img}
                  alt={`${t("building.imageAlt")} ${index + 1}`}
                  fill
                  className="object-contain"
                />
              </SliderMainItem>
            ))}
          </CarouselMainContainer>
          <CarouselThumbsContainer>
            {buildingImages.map((img, index) => (
              <SliderThumbItem
                key={index}
                index={index}
                className="h-32 bg-transparent"
              >
                <Image
                  src={img}
                  alt={`${t("building.imageAlt")} ${index + 1}`}
                  fill
                  className="aspect-square object-cover"
                />
              </SliderThumbItem>
            ))}
          </CarouselThumbsContainer>
        </Carousel>
        <MapPosition
          position={building.position}
          type={(building.buildingType as BuildingType).id}
          className="h-[400px] w-full md:h-[600px]"
        />
      </div>
      <ScrollArea className="lg:max-h-screen lg:w-1/2">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-brown">{building.name}</h1>

          <h3 className="text-2xl font-bold text-brown">
            {t("building.history")}
          </h3>
          <span className="font-source-sans-3">{building.history}</span>

          <h3 className="text- text-2xl font-bold text-brown">
            {t("building.style")}
          </h3>
          <span className="font-source-sans-3">{building.style}</span>

          {building.famousResidents && (
            <>
              <h3 className="text-2xl font-bold text-brown">
                {t("building.famousResidents")}
              </h3>
              <span className="font-source-sans-3">
                {building.famousResidents}
              </span>
            </>
          )}

          {building.renovation && (
            <>
              <h3 className="text-2xl font-bold text-brown">
                {t("building.renovation")}
              </h3>
              <span className="font-source-sans-3">{building.renovation}</span>
            </>
          )}

          <h3 className="text-2xl font-bold text-brown">
            {t("building.presentDay")}
          </h3>
          <span className="font-source-sans-3">{building.presentDay}</span>
        </div>
      </ScrollArea>
    </div>
  );
}
