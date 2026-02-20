import { useMemo, useState } from "react";
import { animationSettings, defaultAnimation } from "@/animations";
import { useAnimationStore } from "@/stores/animationStore";
import { Copy, LoaderPinwheel, Trash2 } from "lucide-react";
import RenderControls from "@/components/RenderControls";
import AnimationParamsPane from "@/components/AnimationParamsPane";
import NewAnimationModal from "@/components/NewAnimationModal";
import {
  archiveAnimationTemplate,
  copyAnimationTemplate,
  createAnimationTemplate,
  CreateAnimationTemplatePayload,
} from "@/api/animationTemplatesApi";
import { toast } from "@/hooks/use-toast";

const Sidebar = () => {
  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const setSelectedAnimationId = useAnimationStore(
    (s) => s.setSelectedAnimationId,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingAnimation, setIsCreatingAnimation] = useState(false);

  const animationOptions = useMemo(
    () =>
      Object.entries(animationSettings).map(([key, s]) => ({
        id: s.id,
        name: s.name,
        key,
      })),
    [],
  );

  const handleCreateAnimation = async (payload: CreateAnimationTemplatePayload) => {
    setIsCreatingAnimation(true);
    try {
      const result = await createAnimationTemplate(payload);
      toast({
        title: "Animation created",
        description: `${result.animation.name} was added. Reloading...`,
      });
      setSelectedAnimationId(result.animation.id);
      setIsCreateModalOpen(false);
      window.location.reload();
    } catch (error) {
      const apiError = error as {code?: string; message?: string};
      toast({
        title: "Failed to create animation",
        description: `${apiError.code || "ERROR"}: ${apiError.message || "Unknown error"}`,
      });
    } finally {
      setIsCreatingAnimation(false);
    }
  };

  const handleArchiveAnimation = async (id: string, name: string) => {
    if (id === defaultAnimation.id) return;
    const confirmed = window.confirm(
      `Archive animation "${name}"?\n\nIt will be moved to src/animations/archive.`,
    );
    if (!confirmed) return;

    try {
      const result = await archiveAnimationTemplate({id});
      toast({
        title: "Animation archived",
        description: `${name} moved to ${result.archived.archivedTo}. Reloading...`,
      });
      window.location.reload();
    } catch (error) {
      const apiError = error as {code?: string; message?: string};
      toast({
        title: "Failed to archive animation",
        description: `${apiError.code || "ERROR"}: ${apiError.message || "Unknown error"}`,
      });
    }
  };

  const handleCopyAnimation = async (id: string, name: string) => {
    if (id === defaultAnimation.id) return;

    try {
      const result = await copyAnimationTemplate({id});
      toast({
        title: "Animation copied",
        description: `${name} copied as ${result.animation.name}. Reloading...`,
      });
      setSelectedAnimationId(result.animation.id);
      window.location.reload();
    } catch (error) {
      const apiError = error as {code?: string; message?: string};
      toast({
        title: "Failed to copy animation",
        description: `${apiError.code || "ERROR"}: ${apiError.message || "Unknown error"}`,
      });
    }
  };

  return (
    <div className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      <NewAnimationModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreatingAnimation}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAnimation}
      />

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
            setIsCreateModalOpen(true);
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
                group cursor-pointer transition-colors flex items-center justify-between gap-2
                ${
                  selectedAnimationId === animation.id
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }
              `}
            >
              <span className="truncate">{animation.name}</span>
              {animation.id !== defaultAnimation.id ? (
                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    aria-label={`Copy ${animation.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleCopyAnimation(animation.id, animation.name);
                    }}
                    className="text-white/45 hover:text-white transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Archive ${animation.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleArchiveAnimation(animation.id, animation.name);
                    }}
                    className="text-white/45 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <span className="w-9 shrink-0" />
              )}
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
