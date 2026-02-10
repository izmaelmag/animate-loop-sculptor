import Timeline from "./Timeline";
import SettingsPanel from "./SettingsPanel";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PlayerPanels() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2">
        <Timeline />
        <SettingsPanel />
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 flex flex-col gap-4 w-[480px]">
      <Timeline />
      <SettingsPanel />
    </div>
  );
}
