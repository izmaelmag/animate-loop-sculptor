import Panel from "@/components/ui/panel";

interface SettingsPanelProps {
  isEnabled?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isEnabled = true,
}) => {
  return (
    <Panel disabled={!isEnabled}>
      <div className="flex items-center justify-center h-full">
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>
      <div className="text-sm text-muted-foreground">
        Animation settings will appear here
      </div>
    </Panel>
  );
};

export default SettingsPanel; 