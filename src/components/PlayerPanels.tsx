import { useState, useEffect } from "react";
import Timeline from "./Timeline";
import SettingsPanel from "./SettingsPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface PlayerPanelsProps {
  onTimeUpdate?: (time: number, normalizedTime: number) => void;
  isPlayable?: boolean;
}

const PlayerPanels: React.FC<PlayerPanelsProps> = ({
  onTimeUpdate,
  isPlayable = true,
}) => {
  const isMobile = useIsMobile();
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

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

  // Render pagination dots
  const renderPaginationDots = () => {
    return (
      <div className="flex justify-center gap-2 mb-2">
        {[0, 1].map((index) => (
          <button
            key={index}
            className={cn(
              "rounded-full transition-all h-[4px]",
              activeSlide === index
                ? "bg-white w-[12px]"
                : "bg-white/70 hover:bg-white w-[4px]"
            )}
            onClick={() => carouselApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="w-full">
        <Carousel setApi={setCarouselApi} className="w-full">
          {renderPaginationDots()}
          <CarouselContent>
            <CarouselItem>
              <Timeline onTimeUpdate={onTimeUpdate} isPlayable={isPlayable} />
            </CarouselItem>
            <CarouselItem>
              <SettingsPanel isEnabled={isPlayable} />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 flex flex-col gap-4 w-[480px]">
      <Timeline onTimeUpdate={onTimeUpdate} isPlayable={isPlayable} />
      <SettingsPanel isEnabled={isPlayable} />
    </div>
  );
};

export default PlayerPanels;
