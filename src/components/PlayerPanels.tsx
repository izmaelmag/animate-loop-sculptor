import Timeline from "./Timeline";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PlayerPanels() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2 mt-4">
        <Timeline />
      </div>
    );
  }

  // Desktop: Floating QuickTime-style player at bottom center of main section
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
      <Timeline />
    </div>
  );
}
