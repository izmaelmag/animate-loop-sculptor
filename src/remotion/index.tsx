import { registerRoot, Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import { animationSettings } from "../animations";

// Default animation template
const DEFAULT_TEMPLATE = "gridOrbit";

// Get settings for the default template
const defaultSettings = animationSettings[DEFAULT_TEMPLATE] || {
  totalFrames: 600,
  fps: 60,
  width: 1080,
  height: 1920,
};

// Make sure totalFrames is consistent with duration and fps
const totalFrames = defaultSettings.totalFrames || 
  (defaultSettings.duration && defaultSettings.fps 
    ? defaultSettings.duration * defaultSettings.fps 
    : 600);

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={totalFrames}
        fps={defaultSettings.fps || 60}
        width={defaultSettings.width || 1080}
        height={defaultSettings.height || 1920}
        defaultProps={{
          templateName: DEFAULT_TEMPLATE,
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);
