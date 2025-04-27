import { registerRoot, Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import { animationSettings, defaultAnimation, AnimationName } from "../animations";

// Default animation template if none specified
const DEFAULT_TEMPLATE_ID = defaultAnimation.id;

// Updated calculateMetadata to use props and provide fallbacks
const calculateMetaData = async ({ props }: { props: Record<string, unknown> }) => {
  // Use templateId/templateName from props (check both?), fall back to default if not provided
  const templateId = (props.templateId || props.templateName || DEFAULT_TEMPLATE_ID) as AnimationName;
  const settings = animationSettings[templateId] || defaultAnimation;

  return {
    durationInFrames: settings.totalFrames,
    fps: settings.fps,
    width: settings.width || 1080, // Provide defaults here too
    height: settings.height || 1920,
  };
};

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        // Set reasonable defaults for width/height/fps/duration
        // calculateMetadata will override these based on props
        durationInFrames={1200} 
        fps={60} 
        width={1080} 
        height={1920} 
        // Remove defaultProps
        // defaultProps={{
        //   templateId: DEFAULT_TEMPLATE_ID, // We get templateId from inputProps now
        // }}
        // calculateMetadata now correctly determines duration/fps/etc.
        // based on the *actual* props received from the render command
        calculateMetadata={calculateMetaData}
        // Props passed to component will be the ones from inputProps
      />
    </>
  );
};

registerRoot(RemotionVideo);
