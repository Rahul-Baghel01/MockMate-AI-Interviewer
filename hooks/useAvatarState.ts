"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AvatarState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "happy"
  | "impressed"
  | "confused"
  | "concerned";

export function useAvatarState(initialState: AvatarState = "idle") {
  const [state, setState] = useState<AvatarState>(initialState);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changeState = useCallback((nextState: AvatarState) => setState(nextState), []);

  useEffect(() => {
    const onVisibilityChange = () => setIsVisible(!document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const scheduleBlink = () => {
      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);
        blinkTimer.current = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, (prefersReducedMotion ? 5000 : 2000) + Math.random() * (prefersReducedMotion ? 3000 : 4000));
    };

    scheduleBlink();
    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
      setIsBlinking(false);
    };
  }, [isVisible, prefersReducedMotion]);

  useEffect(() => {
    if (!isVisible || state !== "idle") return;
    const smileTimer = setTimeout(() => setState("happy"), 8000 + Math.random() * 8000);
    return () => clearTimeout(smileTimer);
  }, [isVisible, state]);

  useEffect(() => {
    if (state !== "happy") return;
    const resetTimer = setTimeout(() => setState("idle"), 1100);
    return () => clearTimeout(resetTimer);
  }, [state]);

  return { state, changeState, isBlinking, isVisible };
}
