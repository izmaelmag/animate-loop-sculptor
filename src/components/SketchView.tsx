import { useEffect, useRef, useState } from "react";
import Timeline from "./Timeline";
import { useAnimation } from "@/contexts/AnimationContext";
import { animations } from "@/animations";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const SketchView = () => {
  const { controller } = useAnimation();
  const sketchRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);

  // Initialize P5 instance when component mounts
  useEffect(() => {
    if (!sketchRef.current || !controller) return;

    // Initialize the controller with the sketch container
    controller.initializeP5(sketchRef.current);
  }, [controller]);

  // Update sketch code when template changes
  useEffect(() => {
    if (!controller) return;
    controller.setAnimationFunction(animations.basic);
  }, [controller]);

  // Handle carousel change
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (!controller) {
    return <div>Loading sketch view...</div>;
  }

  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <div className="flex justify-center gap-2 mt-2">
        {[0, 1].map((index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              activeSlide === index
                ? "bg-primary w-4"
                : "bg-muted-foreground/30"
            )}
            onClick={() => carouselApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-start items-center h-full p-6 relative gap-2">
      <div className="w-full content-area flex h-[100%] min-h-[0px] flex-shrink-1 flex-col">
        <div
          className="w-full h-full flex items-center justify-center"
          ref={sketchRef}
        />
      </div>

      <div className="w-full flex justify-center">
        {isMobile ? (
          <div className="w-full">
            <Carousel setApi={setCarouselApi} className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <Timeline />
                </CarouselItem>
                <CarouselItem>
                  <Timeline />
                </CarouselItem>
              </CarouselContent>
              {renderPaginationDots()}
            </Carousel>
          </div>
        ) : (
          <>
            <Timeline />
            <Timeline />
          </>
        )}
      </div>
    </div>
  );
};

export default SketchView;
