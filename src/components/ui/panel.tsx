import { ReactNode } from "react";
import { clsx as classNames } from "clsx";

interface PanelProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const Panel = ({ children, className, disabled = false }: PanelProps) => {
  return (
    <div
      className={classNames(
        "rounded-md glass-panel w-auto md:w-full md:max-w-[420px] max-w-[100%]",
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