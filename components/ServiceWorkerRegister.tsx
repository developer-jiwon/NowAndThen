"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        // 모바일 Safari 호환성을 위한 지연
        setTimeout(async () => {
          try {
            await navigator.serviceWorker.register("/sw.js", { scope: "/" });
            console.log("Service Worker registered successfully");
          } catch (err) {
            console.error("SW register failed", err);
          }
        }, 100);
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


