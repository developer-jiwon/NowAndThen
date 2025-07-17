"use client"

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// Declare global window type for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseProps {
  adSlot?: string;
  adFormat?: string;
  adLayout?: string;
  adLayoutKey?: string;
  className?: string;
}

export default function AdSenseComponent({ 
  adSlot = "auto",
  adFormat = "auto", 
  adLayout,
  adLayoutKey,
  className = "my-4"
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  useEffect(() => {
    const loadAd = () => {
      try {
        // Check if adsbygoogle is available and the element exists
        if (typeof window !== "undefined" && 
            window.adsbygoogle && 
            adRef.current && 
            !isLoaded) {
          
          // Check if this ad element already has ads
          const hasAds = adRef.current.getAttribute('data-ad-status');
          
          if (!hasAds) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setIsLoaded(true);
            setAdError(null);
          }
        }
      } catch (error) {
        console.error("AdSense loading error:", error);
        setAdError(error instanceof Error ? error.message : "Unknown AdSense error");
      }
    };

    // Delay ad loading to ensure DOM is ready
    const timer = setTimeout(loadAd, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoaded]);

  // Reset when component unmounts or re-mounts
  useEffect(() => {
    return () => {
      setIsLoaded(false);
      setAdError(null);
    };
  }, []);

  if (adError) {
    return (
      <div className={`${className} text-center text-gray-500 text-sm`}>
        {/* Ad space - error occurred */}
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
        id="adsense-script"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          // Script loaded, but don't push ads yet
        }}
        onError={(e) => {
          console.error("AdSense script error:", e);
          setAdError("Failed to load AdSense script");
        }}
      />
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client="ca-pub-XXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive="true"
      />
    </div>
  );
} 