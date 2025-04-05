import { registerRoot, Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import { animationSettings, defaultAnimation } from "../animations";

// Default animation template if none specified
const DEFAULT_TEMPLATE_ID = defaultAnimation.id;

const calculateMetaData = async (props: Record<string, unknown>) => {
  const settings = animationSettings[props.templateId as string] || defaultAnimation;

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
          templateId: DEFAULT_TEMPLATE_ID,
        }}
        calculateMetadata={async ({ props }) => {
          return await calculateMetaData(props);
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);
