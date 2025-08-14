"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (err) {
        // swallow errors; registration is non-critical
        console.error("SW register failed", err);
      }
    };

    // Only register in production builds to avoid dev HMR issues
    if (process.env.NODE_ENV === "production") {
      register();
    }
  }, []);

  return null;
}


