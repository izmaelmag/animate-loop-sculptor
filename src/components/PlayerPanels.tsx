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
        {[0, 1, 2].map((index) => (
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

  return (
    <div className="w-full flex justify-center">
      {isMobile ? (
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
      ) : (
        <div className="flex w-full flex-row gap-2 items-stretch justify-center">
          <Timeline onTimeUpdate={onTimeUpdate} isPlayable={isPlayable} />
          <SettingsPanel isEnabled={isPlayable} />
        </div>
      )}
    </div>
  );
};

export default PlayerPanels;
