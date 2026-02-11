import { registerRoot, Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import { animationSettings, defaultAnimation } from "../animations";

const calculateMetaData = async ({
  props,
}: {
  props: Record<string, unknown>;
}) => {
  const requestedTemplateId = props.templateId as string | undefined;
  const templateId = requestedTemplateId || defaultAnimation.id;
  const settings = animationSettings[templateId];

  if (requestedTemplateId && !settings) {
    throw new Error(`Unknown templateId "${requestedTemplateId}"`);
  }

  return {
    durationInFrames: (settings || defaultAnimation).totalFrames,
    fps: (settings || defaultAnimation).fps,
    width: (settings || defaultAnimation).width || 1080,
    height: (settings || defaultAnimation).height || 1920,
  };
};

export const RemotionVideo = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={1200}
      fps={60}
      width={1080}
      height={1920}
      calculateMetadata={calculateMetaData}
    />
  );
};

registerRoot(RemotionVideo);
