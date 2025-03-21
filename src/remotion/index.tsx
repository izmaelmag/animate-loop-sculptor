import { parseMedia } from "@remotion/media-parser";
import { registerRoot, Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import { animationSettings } from "../animations";

// Default animation template if none specified
const DEFAULT_TEMPLATE = "gridOrbit";

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
          return {
            durationInFrames:
              animationSettings[props.templateName as string].totalFrames,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);
