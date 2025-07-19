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
  // Check if AdSense is approved via environment variable
  const isAdSenseApproved = process.env.NEXT_PUBLIC_ADSENSE_APPROVED === 'true';
  
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<string>('loading');

  useEffect(() => {
    // Don't load ads if not approved
    if (!isAdSenseApproved) return;
    
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
            
            // Monitor ad status
            const checkAdStatus = () => {
              if (adRef.current) {
                const status = adRef.current.getAttribute('data-ad-status');
                if (status === 'filled') {
                  setAdStatus('filled');
                } else if (status === 'unfilled') {
                  setAdStatus('unfilled');
                  setAdError('No ads available');
                }
              }
            };
            
            // Check status after a delay
            setTimeout(checkAdStatus, 2000);
          }
        }
      } catch (error) {
        console.error("AdSense loading error:", error);
        setAdError(error instanceof Error ? error.message : "Unknown AdSense error");
        setAdStatus('error');
      }
    };

    // Delay ad loading to ensure DOM is ready
    const timer = setTimeout(loadAd, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoaded, isAdSenseApproved]);

  // Reset when component unmounts or re-mounts
  useEffect(() => {
    return () => {
      setIsLoaded(false);
      setAdError(null);
      setAdStatus('loading');
    };
  }, []);

  // Don't render anything if AdSense is not approved
  if (!isAdSenseApproved) {
    return null;
  }

  // Don't show error state - just hide the ad space
  if (adError || adStatus === 'unfilled') {
    return null;
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
          setAdStatus('error');
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