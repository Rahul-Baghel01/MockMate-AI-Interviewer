import { cn } from "@/lib/utils";
import type { AvatarState } from "@/hooks/useAvatarState";

const labels: Record<AvatarState, string> = {
  idle: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  happy: "Happy",
  impressed: "Impressed",
  confused: "Clarifying",
  concerned: "Needs attention",
};

export function AvatarStatus({ state, isVisible }: { state: AvatarState; isVisible: boolean }) {
  return (
    <div className="mt-4 flex min-h-6 items-center justify-center gap-2 text-xs font-medium text-primary-100" aria-live="polite">
      {state === "speaking" && (
        <span className="flex h-4 items-center gap-0.5" aria-hidden="true">
          {[7, 13, 9, 15].map((height, index) => (
            <span key={height} className={cn("avatar-wave w-0.5 rounded-full bg-primary-200 motion-reduce:animate-none", !isVisible && "[animation-play-state:paused]")} style={{ height, animationDelay: `${index * 100}ms` }} />
          ))}
        </span>
      )}
      <span>{labels[state]}</span>
    </div>
  );
}
