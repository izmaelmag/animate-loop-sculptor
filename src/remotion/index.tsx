import { registerRoot, Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import { animationSettings, defaultAnimation } from "../animations";

const calculateMetaData = async ({
  props,
}: {
  props: Record<string, unknown>;
}) => {
  const templateId =
    (props.templateId as string) || defaultAnimation.id;
  const settings = animationSettings[templateId] || defaultAnimation;

  return {
    durationInFrames: settings.totalFrames,
    fps: settings.fps,
    width: settings.width || 1080,
    height: settings.height || 1920,
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
