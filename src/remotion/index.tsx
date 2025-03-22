import { registerRoot, Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import { getAnimationSettingsByName } from "../animations";

// Default animation template if none specified
const DEFAULT_TEMPLATE = "gridOrbit";

const calculateMetaData = async (props: Record<string, unknown>) => {
  const settings = getAnimationSettingsByName(props.templateName as string);

  return {
    durationInFrames: settings.totalFrames,
    fps: settings.fps,
    width: settings.width,
    height: settings.height,
  };
};

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={1200} // Maximum possible duration, actual animation determines real duration
        fps={60} // Default fps, actual animation can override this
        width={1080} // Default width
        height={1920} // Default height
        defaultProps={{
          templateName: DEFAULT_TEMPLATE,
        }}
        calculateMetadata={async ({ props }) => {
          return await calculateMetaData(props);
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);
