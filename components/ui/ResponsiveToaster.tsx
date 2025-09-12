"use client";

import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export default function ResponsiveToaster(): React.ReactElement {
  const [position, setPosition] = useState<Position>("bottom-center");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setPosition(mq.matches ? "top-center" : "bottom-center");
    // set initial value
    onChange();

    // Preferred modern API
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }

    // Fallback for older browsers that support addListener/removeListener
    type LegacyMQL = {
      addListener?: (cb: (e: MediaQueryList | MediaQueryListEvent) => void) => void;
      removeListener?: (cb: (e: MediaQueryList | MediaQueryListEvent) => void) => void;
    };
    const legacyMq = mq as unknown as LegacyMQL;
    if (typeof legacyMq.addListener === "function") {
      const legacyListener = () => onChange();
      legacyMq.addListener(legacyListener);
      return () => legacyMq.removeListener?.(legacyListener);
    }

    return undefined;
  }, []);

  return <Toaster position={position} expand={true} richColors={true} />;
}
