import { cn } from "@/lib/utils";
import type { AvatarState } from "@/hooks/useAvatarState";
import { AvatarEyes } from "./AvatarEyes";
import { AvatarMouth } from "./AvatarMouth";

interface AvatarFaceProps {
  state: AvatarState;
  isBlinking: boolean;
  isVisible: boolean;
}

export function AvatarFace({ state, isBlinking, isVisible }: AvatarFaceProps) {
  const thoughtful = state === "thinking" || state === "confused";
  const serious = state === "concerned";

  return (
    <div
      className={cn(
        "avatar-face relative size-28 transition-transform duration-500 motion-reduce:transform-none",
        isVisible && state === "idle" && "avatar-breathe",
        isVisible && state === "listening" && "avatar-listen",
        isVisible && state === "thinking" && "avatar-think",
        isVisible && (state === "happy" || state === "impressed") && "avatar-listen",
      )}
    >
      <svg viewBox="0 0 120 120" className="size-full overflow-visible drop-shadow-[0_10px_14px_rgba(0,0,0,0.28)]" role="img" aria-label="Professional female AI interviewer">
        <defs>
          <linearGradient id="avatarHair" x1="24" y1="18" x2="96" y2="92" gradientUnits="userSpaceOnUse">
            <stop stopColor="#51445f" />
            <stop offset="1" stopColor="#2d273c" />
          </linearGradient>
          <linearGradient id="avatarSkin" x1="37" y1="28" x2="82" y2="91" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff9fa" />
            <stop offset="1" stopColor="#ded1dc" />
          </linearGradient>
          <linearGradient id="avatarBlazer" x1="60" y1="91" x2="60" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#756da5" />
            <stop offset="1" stopColor="#40395f" />
          </linearGradient>
        </defs>

        <g id="shoulders">
          <path d="M17 120C19 103 31 96 47 93H73C89 96 101 103 103 120Z" fill="url(#avatarBlazer)" />
          <path d="M47 93L60 105L73 93C69 91 66 89 66 84H54C54 89 51 91 47 93Z" fill="#eadde2" />
          <path d="M47 93L60 105L53 111L39 98Z" fill="#5a527f" opacity="0.9" />
          <path d="M73 93L60 105L67 111L81 98Z" fill="#5a527f" opacity="0.9" />
        </g>

        <g id="hair" aria-hidden="true">
          <path d="M25 55C25 30 39 16 60 16C81 16 95 30 95 55V91C89 96 83 98 77 98L76 55H44L43 98C37 98 31 96 25 91Z" fill="url(#avatarHair)" />
          <path d="M29 59C25 70 25 85 30 95" fill="none" stroke="#65536f" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <path d="M91 59C95 70 95 85 90 95" fill="none" stroke="#211d30" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        </g>

        <g id="face">
          <path d="M31 48C31 29 43 21 60 21C77 21 89 29 89 48V61C89 80 77 92 60 94C43 92 31 80 31 61Z" fill="url(#avatarSkin)" stroke="#fff" strokeOpacity="0.55" />
          <ellipse cx="31.5" cy="61" rx="3" ry="6" fill="#e2d4dd" />
          <ellipse cx="88.5" cy="61" rx="3" ry="6" fill="#e2d4dd" />
          <g id="eyebrows">
            <path className={cn(thoughtful && "avatar-brow-raised", serious && "avatar-brow-serious-left")} d="M39 44Q45 41 51 44" fill="none" stroke="#66536c" strokeWidth="1.7" strokeLinecap="round" />
            <path className={cn(thoughtful && "avatar-brow-raised", serious && "avatar-brow-serious-right")} d="M69 44Q75 41 81 44" fill="none" stroke="#66536c" strokeWidth="1.7" strokeLinecap="round" />
          </g>
          <AvatarEyes state={state} isBlinking={isBlinking} />
          <path d="M60 56V64Q62 66 64 64" fill="none" stroke="#b899a7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <AvatarMouth state={state} />
        </g>

        <g id="front-hair" aria-hidden="true">
          <path d="M31 47C32 29 43 20 60 20C52 22 47 27 43 34C40 39 36 44 31 47Z" fill="#554760" />
          <path d="M60 20C76 21 86 31 89 47C84 43 81 38 78 32C74 26 68 22 60 20Z" fill="#3a3049" />
          <path d="M58 21C55 25 49 29 43 31" fill="none" stroke="#76627e" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        </g>

        <g id="headset" aria-hidden="true">
          <path d="M25 59V48C25 28 40 14 60 14C80 14 95 28 95 48V59" fill="none" stroke="#c7c2ef" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <rect x="22" y="54" width="6" height="15" rx="3" fill="#514b78" stroke="#c7c2ef" strokeWidth="1.2" />
          <rect x="92" y="54" width="6" height="15" rx="3" fill="#514b78" stroke="#c7c2ef" strokeWidth="1.2" />
          <path d="M95 66C94 76 87 79 77 78" fill="none" stroke="#c7c2ef" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="75" cy="78" r="2.3" fill="#cac5fe" />
        </g>
      </svg>
    </div>
  );
}
