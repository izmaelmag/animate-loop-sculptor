import { AnimationSettings, R3FSceneProps } from "@/types/animations";
import type { JSX } from "react";

const FPS = {{fpsLiteral}};
const WIDTH = {{widthLiteral}};
const HEIGHT = {{heightLiteral}};
const DURATION_SECONDS = {{durationSecondsLiteral}};

function Scene({ ctx }: R3FSceneProps): JSX.Element {
  const angle = ctx.normalizedTime * Math.PI * 2;

  return (
    <>
      <color attach="background" args={["#04060a"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 2, 2]} intensity={1.1} />

      <mesh rotation={[angle * 0.35, angle, 0]}>
        <torusKnotGeometry args={[0.65, 0.2, 180, 24]} />
        <meshStandardMaterial color="#8f8bff" roughness={0.35} metalness={0.45} />
      </mesh>
    </>
  );
}

export const settings: AnimationSettings = {
  id: {{idLiteral}},
  name: {{displayNameLiteral}},
  renderer: "r3f",
  fps: FPS,
  totalFrames: FPS * DURATION_SECONDS,
  width: WIDTH,
  height: HEIGHT,
  draw: Scene,
};
