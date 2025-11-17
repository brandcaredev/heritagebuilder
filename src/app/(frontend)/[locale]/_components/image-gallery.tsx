"use client";

import {
  Carousel,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
  SliderThumbItem,
} from "@/components/carousel-bottom-thumbnails";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  CarouselContent as DefaultCarouselContent,
  CarouselItem as DefaultCarouselItem,
  Carousel as DefaultCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export default function GalleryWithDialog({ images }: { images: string[] }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useTranslations();

  return (
    <Carousel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <CarouselMainContainer className="h-[400px] cursor-pointer md:h-[700px]">
            {images.map((img, index) => (
              <SliderMainItem
                key={index}
                className="relative h-full w-full bg-transparent"
              >
                <Image
                  src={img}
                  alt={`${t("building.imageAlt")} ${index + 1}`}
                  className="object-cover"
                  fill
                  priority={index === 0}
                  onClick={() => setActiveIndex(index)}
                />
              </SliderMainItem>
            ))}
          </CarouselMainContainer>
        </DialogTrigger>

        <DialogContent
          closeButtonClassName={"text-white"}
          className="container z-10 h-screen max-w-none border-0 bg-transparent p-0"
        >
          <DialogTitle hidden>Images</DialogTitle>
          <FullScreenCarousel initialIndex={activeIndex} images={images} />
        </DialogContent>
      </Dialog>

      <CarouselThumbsContainer>
        {images.map((img, index) => (
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
  );
}

function FullScreenCarousel({
  initialIndex,
  images,
}: {
  initialIndex: number;
  images: string[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: initialIndex,
  });
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="container relative mx-auto flex flex-col justify-center gap-4 overflow-hidden">
      {/* Main Embla Carousel  */}
      <div className="relative w-full overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative flex h-[80vh] w-full flex-[0_0_100%] justify-center rounded-lg sm:h-[80vh] sm:w-auto"
            >
              <Image
                src={src}
                alt={`Image ${index + 1}`}
                className="h-auto rounded-lg object-contain"
                fill
              />
            </div>
          ))}
        </div>
        <button
          className="absolute left-0 top-1/2 hidden -translate-y-1/2 transform rounded-sm bg-black/80 p-2 sm:block"
          onClick={scrollPrev}
        >
          <ChevronLeft className="text-white" size={32} />
        </button>
        <button
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 transform rounded-sm bg-black/80 p-2 sm:block"
          onClick={scrollNext}
        >
          <ChevronRight className="text-white" size={32} />
        </button>
      </div>
      <DefaultCarousel>
        <DefaultCarouselContent className="ml-0 flex gap-4 lg:items-center lg:justify-center">
          {images.map((src, index) => (
            <DefaultCarouselItem key={index}>
              <div
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative h-24 w-24 cursor-pointer rounded-lg border",
                  index === selectedIndex
                    ? "border-white"
                    : "border-transparent",
                )}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  className="rounded-lg object-cover"
                  fill
                />
              </div>
            </DefaultCarouselItem>
          ))}
        </DefaultCarouselContent>
      </DefaultCarousel>
    </div>
  );
}
