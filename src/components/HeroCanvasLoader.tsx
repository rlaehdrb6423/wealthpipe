"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function HeroCanvasLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isMobile()) return;
    const id = requestIdleCallback(() => setShow(true), { timeout: 400 });
    return () => cancelIdleCallback(id);
  }, []);

  return show ? <HeroCanvas /> : null;
}
