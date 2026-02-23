import { AnimationSettings, R3FSceneProps } from "../../types/animations";
import type { JSX } from "react";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const TOTAL_FRAMES = FPS * 8;

function DemoScene({ ctx }: R3FSceneProps): JSX.Element {
  const t = ctx.normalizedTime;
  const angle = t * Math.PI * 2;
  const pulse = 0.75 + 0.25 * Math.sin(angle * 2.0);
  const orbitRadius = 1.15 + 0.15 * Math.sin(angle * 3.0);

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={1.2} />
      <pointLight position={[x * 1.6, y * 1.6, 1.3]} intensity={2.2 * pulse} />

      <mesh rotation={[angle * 0.5, angle, 0]}>
        <torusKnotGeometry args={[0.6 * pulse, 0.2, 180, 24]} />
        <meshStandardMaterial color="#8b7cff" roughness={0.35} metalness={0.5} />
      </mesh>

      <mesh position={[x, y, -0.2]} scale={0.22 + 0.07 * pulse}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#6be2ff" emissive="#1f5670" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={3}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#0f1118" roughness={0.95} metalness={0.05} />
      </mesh>
    </>
  );
}

export const settings: AnimationSettings = {
  id: "r3f-demo",
  name: "🧊 Basic Scene",
  renderer: "r3f",
  fps: FPS,
  totalFrames: TOTAL_FRAMES,
  width: WIDTH,
  height: HEIGHT,
  draw: DemoScene,
};
