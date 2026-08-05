import { cn } from "@/lib/utils";
import type { AvatarState } from "@/hooks/useAvatarState";
import { AvatarFace } from "./AvatarFace";
import { AvatarStatus } from "./AvatarStatus";

interface AIAvatarProps {
  state: AvatarState;
  isBlinking: boolean;
  isVisible: boolean;
}

export function AIAvatar({ state, isBlinking, isVisible }: AIAvatarProps) {
  const active = state === "speaking";

  return (
    <div className={cn("flex flex-col items-center", !isVisible && "[&_*]:[animation-play-state:paused]")}>
      <div className="relative flex size-32 items-center justify-center">
        <span className={cn("absolute inset-2 rounded-full bg-primary-200/15 blur-xl transition-opacity duration-500", active ? "opacity-100 avatar-speaking-glow" : "opacity-30")} aria-hidden="true" />
        {active && <span className="absolute inset-1 rounded-full border border-primary-200/45 avatar-speaking-ring motion-reduce:animate-none" aria-hidden="true" />}
        {state === "thinking" && <span className="absolute -right-1 top-2 text-lg text-primary-100 avatar-thought motion-reduce:animate-none" aria-hidden="true">•••</span>}
        <AvatarFace state={state} isBlinking={isBlinking} isVisible={isVisible} />
      </div>
      <AvatarStatus state={state} isVisible={isVisible} />
    </div>
  );
}
