"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

export default function HeroCanvasLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestIdleCallback(() => setShow(true), { timeout: 200 });
    return () => cancelIdleCallback(id);
  }, []);

  return show ? <HeroCanvas /> : null;
}
