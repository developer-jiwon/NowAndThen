"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  // Completely disabled service worker to prevent errors
  useEffect(() => {
    console.log('Service Worker registration disabled to prevent errors');
  }, []);

  return null;
}


