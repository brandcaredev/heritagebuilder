"use client";
import { Button } from "@/components/ui";
import { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { YoutubeLink } from "payload-types";
import { useCallback, useEffect, useRef, useState } from "react";

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

const VideoCarousel = ({ videos }: { videos: YoutubeLink[] }) => {
  const t = useTranslations();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollSnaps = emblaApi?.scrollSnapList() ?? [];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla__slide__number")!;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap?.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const scale = numberWithinRange(tweenValue, 0, 1).toString();
          const tweenNode = tweenNodes.current[slideIndex];
          if (!tweenNode) return;
          tweenNode.style.transform = `scale(${scale})`;
        });
      });
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale)
      .on("select", onSelect)
      .on("reInit", onSelect);
    return () => {
      emblaApi
        .off("reInit", setTweenNodes)
        .off("reInit", setTweenFactor)
        .off("reInit", tweenScale)
        .off("scroll", tweenScale)
        .off("slideFocus", tweenScale)
        .off("select", onSelect)
        .off("reInit", onSelect);
    };
  }, [emblaApi, onSelect, setTweenFactor, setTweenNodes, tweenScale]);

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="embla bg-brown-900 w-full overflow-hidden rounded-lg">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">
            {t("videoCarousel.title")}
          </h1>
        </div>
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="embla__slide relative min-w-0 flex-[0_0_70%] px-4"
              >
                <div
                  className="embla__slide__inner relative transition-all duration-300 ease-out"
                  style={{
                    transform: `scale(${index === selectedIndex ? 1 : 0.7})`,
                    opacity: index === selectedIndex ? 1 : 0.5,
                  }}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    {index === selectedIndex ? (
                      <iframe
                        src={video.url.replace("watch?v=", "embed/")}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <iframe
                        src={video.url.replace("watch?v=", "embed/")}
                        className="pointer-events-none h-full w-full"
                      />
                    )}
                  </div>
                  <div
                    className={`mt-4 transition-all duration-300 ${index === selectedIndex ? "opacity-100" : "opacity-0"}`}
                  >
                    <h2 className="text-xl font-semibold text-white">
                      {video.title}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          {scrollSnaps.map((_, index) => (
            <Button
              key={index}
              className={`mx-1 h-3 w-3 rounded-full ${
                index === selectedIndex ? "bg-white" : "bg-white/30"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoCarousel;
