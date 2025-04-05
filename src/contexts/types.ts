import { AnimationController } from "@/utils/AnimationController";

export interface AnimationContextType {
  controller: AnimationController | null;
  currentAnimationId: string;
  setCurrentAnimationId: (id: string) => void;
}

export interface AnimationProviderProps {
  children: React.ReactNode;
}
