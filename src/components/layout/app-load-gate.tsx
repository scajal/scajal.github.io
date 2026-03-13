"use client";

import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";

const MIN_LOAD_TIME_MS = 400;
const FADE_OUT_MS = 500;

export function AppLoadGate({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hideLoader, setHideLoader] = useState(false);

  useEffect(() => {
    const start = Date.now();

    const applyLoaded = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_LOAD_TIME_MS - elapsed);
      setTimeout(() => {
        setIsLoaded(true);
      }, remaining);
    };

    if (typeof window === "undefined") return;

    if (document.readyState === "complete") {
      applyLoaded();
      return;
    }

    window.addEventListener("load", applyLoaded);
    return () => window.removeEventListener("load", applyLoaded);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setExiting(true);
    const t = setTimeout(() => setHideLoader(true), FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [isLoaded]);

  return (
    <>
      {children}
      {!hideLoader && <LoadingScreen exiting={exiting} />}
    </>
  );
}
