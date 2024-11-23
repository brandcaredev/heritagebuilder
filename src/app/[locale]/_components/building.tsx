import {
  Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type BuildingPreviewData } from "@/lib/types";
import Image from "next/image";

export default function BuildingComponent({
  building,
}: {
  building: BuildingPreviewData;
}) {
  const buildingImages = [building.featuredImage, ...building.images];
  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="lg:w-1/2 flex flex-col">
        <Carousel>
          <CarouselMainContainer className="h-[600px]">
            {buildingImages.map((img, index) => (
              <SliderMainItem
                key={index}
                className="relative h-full w-full bg-transparent"
              >
                <Image
                  src={img}
                  alt={"Building image" + index}
                  loading="lazy"
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
                  alt={"Building image" + index}
                  loading="lazy"
                  fill
                  className="aspect-square object-cover"
                />
              </SliderThumbItem>
            ))}
          </CarouselThumbsContainer>
        </Carousel>
      </div>
      <ScrollArea className="lg:max-h-screen lg:w-1/2">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-brown">{building.name}</h1>

          <h3 className="text-2xl font-bold text-brown">History</h3>
          <span className="text-justify font-source-sans-3">
            {building.history}
          </span>

          <h3 className="text- text-2xl font-bold text-brown">Style</h3>
          <span className="text-justify font-source-sans-3">
            {building.style}
          </span>

          {building.famousresidents && (
            <>
              <h3 className="text-2xl font-bold text-brown">
                Famous residents
              </h3>
              <span className="font-source-sans-3">
                {building.famousresidents}
              </span>
            </>
          )}

          {building.renovation && (
            <>
              <h3 className="text-2xl font-bold text-brown">Renovation</h3>
              <span className="font-source-sans-3">{building.renovation}</span>
            </>
          )}

          <h3 className="text-2xl font-bold text-brown">Present day</h3>
          <span className="font-source-sans-3">{building.presentday}</span>
        </div>
      </ScrollArea>
    </div>
  );
}
