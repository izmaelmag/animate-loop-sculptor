import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const Panel = ({ children, className, disabled = false }: PanelProps) => {
  return (
    <div
      className={cn(
        "rounded-md glass-panel w-auto md:w-full max-w-[420px]",
        "flex flex-col gap-2 p-3 md:p-4 border-box m-2 md:m-0",
        disabled && "opacity-70 pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Panel; 