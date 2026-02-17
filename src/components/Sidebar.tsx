import { useMemo } from "react";
import { animationSettings } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";
import { LoaderPinwheel } from "lucide-react";
import RenderControls from "@/components/RenderControls";
import AnimationParamsPane from "@/components/AnimationParamsPane";
import { createAnimationTemplate } from "@/api/animationTemplatesApi";
import { toast } from "@/hooks/use-toast";

const rendererPromptMap = {
  "1": "p5",
  "2": "webgl",
  "3": "r3f",
  p5: "p5",
  webgl: "webgl",
  r3f: "r3f",
} as const;

const resolveRendererChoice = (
  input: string,
): "p5" | "webgl" | "r3f" | null => {
  const normalized = input.trim().toLowerCase();
  return rendererPromptMap[normalized as keyof typeof rendererPromptMap] || null;
};

const Sidebar = () => {
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const setSelectedAnimationId = useAnimationStore(
    (s) => s.setSelectedAnimationId,
  );

  const animationOptions = useMemo(
    () =>
      Object.entries(animationSettings).map(([key, s]) => ({
        id: s.id,
        name: s.name,
        key,
      })),
    [],
  );

  const handleCreateAnimation = async () => {
    const name = window.prompt("New animation name:");
    if (!name || !name.trim()) return;
    const rendererInput = window.prompt(
      "Choose renderer:\n1) 🎨 p5\n2) 🧪 webgl\n3) 🧊 r3f",
      "p5",
    );
    if (!rendererInput) return;
    const renderer = resolveRendererChoice(rendererInput);
    if (!renderer) {
      toast({
        title: "Invalid renderer",
        description: "Use 1/2/3 or p5/webgl/r3f.",
      });
      return;
    }

    try {
      const result = await createAnimationTemplate({
        name: name.trim(),
        renderer,
      });
      toast({
        title: "Animation created",
        description: `${result.animation.name} was added. Reloading...`,
      });
      setSelectedAnimationId(result.animation.id);
      window.location.reload();
    } catch (error) {
      const apiError = error as {code?: string; message?: string};
      toast({
        title: "Failed to create animation",
        description: `${apiError.code || "ERROR"}: ${apiError.message || "Unknown error"}`,
      });
    }
  };

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <LoaderPinwheel size={24} className="text-white" />
          <span className="text-white text-xl font-bold">Sculptor</span>
        </div>
      </div>

      {/* Animations List */}
      <div className="flex-1 overflow-y-auto p-4">
        <button
          type="button"
          onClick={() => {
            void handleCreateAnimation();
          }}
          className="w-full mb-3 px-3 py-2 rounded border border-neutral-700 text-sm text-white/90 hover:bg-neutral-800 transition-colors"
        >
          New animation
        </button>

        <div className="space-y-1">
          {animationOptions.map((animation) => (
            <div
              key={animation.key}
              onClick={() => setSelectedAnimationId(animation.id)}
              className={`
                cursor-pointer transition-colors
                ${
                  selectedAnimationId === animation.id
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }
              `}
            >
              {animation.name}
            </div>
          ))}
        </div>
      </div>

      <AnimationParamsPane />

      <div className="p-4 border-t border-neutral-800">
        <RenderControls />
      </div>
    </div>
  );
};

export default Sidebar;
