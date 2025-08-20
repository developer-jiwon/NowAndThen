"use client"

import { useEffect, useRef, useState } from "react";

// Declare global window type for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseProps {
  adSlot: string; // REQUIRED: real slot id
  adFormat?: string;
  adLayout?: string;
  adLayoutKey?: string;
  className?: string;
  pageType?: 'content' | 'app' | 'landing';
}

export default function AdSenseComponent({ 
  adSlot,
  adFormat = "auto", 
  adLayout,
  adLayoutKey,
  className = "my-4",
  pageType = 'content'
}: AdSenseProps) {
  // Check if AdSense is approved via environment variable
  const isAdSenseApproved = process.env.NEXT_PUBLIC_ADSENSE_APPROVED === 'true';
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. ca-pub-xxxxxxxx
  
  const adRef = useRef<HTMLModElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<string>('loading');
  const [hasContent, setHasContent] = useState(false);

  // Verify page has sufficient content before showing ads
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkContent = () => {
      // Check for substantial content on the page
      const mainContent = document.querySelector('main') || document.body;
      const textContent = mainContent?.textContent || '';
      const wordCount = textContent.trim().split(/\s+/).length;
      
      // Balanced thresholds
      const minWords = pageType === 'content' ? 60 : 25;
      const hasSufficientContent = wordCount >= minWords;
      
      setHasContent(hasSufficientContent);
      
      if (!hasSufficientContent) {
        // process.env.NODE_ENV === 'development' && console.log(`Insufficient content for ads: ${wordCount} words (minimum: ${minWords})`);
        setAdStatus('no-content');
      }
    };
    
    // Check content after a delay to ensure page is loaded
    const timer = setTimeout(checkContent, 1000);
    return () => clearTimeout(timer);
  }, [pageType]);

  useEffect(() => {
    // Don't load ads if not approved or no content or missing config
    if (!isAdSenseApproved || !hasContent || !adClient || !adSlot) return;
    
    // Check if container is wide enough for ads
    if (adRef.current) {
      const containerWidth = adRef.current.offsetWidth;
      if (containerWidth < 300) {
        process.env.NODE_ENV === 'development' && console.log(`Container too narrow for ads: ${containerWidth}px (minimum: 300px)`);
        setAdStatus('container-too-small');
        return;
      }
    }
    
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
            
            // Monitor ad status with multiple checks
            const checkAdStatus = () => {
              if (adRef.current) {
                const status = adRef.current.getAttribute('data-ad-status');
                const height = adRef.current.offsetHeight;
                
                if (status === 'filled' && height > 50) {
                  setAdStatus('filled');
                  process.env.NODE_ENV === 'development' && console.log('Ad successfully loaded and filled');
                } else if (status === 'unfilled' || height < 50) {
                  setAdStatus('unfilled');
                  setAdError('No ads available');
                  process.env.NODE_ENV === 'development' && console.log('Ad space unfilled or too small');
                }
              }
            };
            
            // Check status multiple times with balanced delays
            setTimeout(checkAdStatus, 800);
            setTimeout(checkAdStatus, 2500);
            setTimeout(checkAdStatus, 4500);
          }
        }
      } catch (error) {
        console.error("AdSense loading error:", error);
        setAdError(error instanceof Error ? error.message : "Unknown AdSense error");
        setAdStatus('error');
      }
    };

    // Delay ad loading to ensure DOM is ready and content is verified
    const timer = setTimeout(loadAd, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoaded, isAdSenseApproved, hasContent]);

  // Reset when component unmounts or re-mounts
  useEffect(() => {
    return () => {
      setIsLoaded(false);
      setAdError(null);
      setAdStatus('loading');
    };
  }, []);

  // Don't render anything if AdSense is not approved or missing config
  if (!isAdSenseApproved || !adClient || !adSlot) {
    return null;
  }

  // Don't show anything if no content or ad errors
  if (!hasContent || adError || adStatus === 'unfilled' || adStatus === 'no-content' || adStatus === 'container-too-small') {
    return null;
  }

  return (
    <div className={className} style={{ minHeight: 280 }}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center", minHeight: 250 }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive="true"
        data-adtest="off"
      />
    </div>
  );
} 