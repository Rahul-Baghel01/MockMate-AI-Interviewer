import { cn } from "@/lib/utils";
import type { AvatarState } from "@/hooks/useAvatarState";

interface AvatarEyesProps {
  state: AvatarState;
  isBlinking: boolean;
}

export function AvatarEyes({ state, isBlinking }: AvatarEyesProps) {
  const narrowed = state === "concerned" || state === "confused";
  const delighted = state === "happy" || state === "impressed";

  return (
    <g aria-hidden="true">
      {[45, 75].map((centerX) => (
        <g
          key={centerX}
          className={cn("avatar-svg-eye transition-transform duration-150", isBlinking && "avatar-svg-eye-blink", narrowed && "avatar-svg-eye-narrow", delighted && "avatar-svg-eye-soft")}
          style={{ transformOrigin: `${centerX}px 53px` }}
        >
          <ellipse cx={centerX} cy="53" rx="4.5" ry="5.5" fill="#302941" />
          {!isBlinking && <circle cx={centerX - 1.5} cy="51" r="1.35" fill="#fff" opacity="0.88" />}
        </g>
      ))}
    </g>
  );
}
