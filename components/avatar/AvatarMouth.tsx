import { cn } from "@/lib/utils";
import type { AvatarState } from "@/hooks/useAvatarState";

export function AvatarMouth({ state }: { state: AvatarState }) {
  const smiling = state === "happy" || state === "impressed";

  return (
    <g className="avatar-mouth-wrapper" aria-hidden="true">
      {state === "speaking" ? (
        <ellipse className="avatar-mouth-speaking" cx="60" cy="73" rx="9" ry="3.2" fill="#925f83" />
      ) : state === "concerned" ? (
        <path d="M52 75 Q60 70 68 75" fill="none" stroke="#79556f" strokeWidth="2" strokeLinecap="round" />
      ) : state === "confused" ? (
        <path d="M54 73 Q60 71 66 73" fill="none" stroke="#79556f" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path
          className={cn("transition-opacity duration-200", smiling && "opacity-100")}
          d={smiling ? "M50 70 Q60 79 70 70" : "M52 71 Q60 77 68 71"}
          fill="none"
          stroke="#79556f"
          strokeWidth={smiling ? 2.4 : 2}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}
