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
  pageType?: 'content' | 'app' | 'landing';
}

export default function AdSenseComponent({ 
  adSlot = "auto",
  adFormat = "auto", 
  adLayout,
  adLayoutKey,
  className = "my-4",
  pageType = 'content'
}: AdSenseProps) {
  // Check if AdSense is approved via environment variable
  const isAdSenseApproved = process.env.NEXT_PUBLIC_ADSENSE_APPROVED === 'true';
  
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
      
      // Minimum 100 words for content pages, 50 for app pages
      const minWords = pageType === 'content' ? 100 : 50;
      const hasSufficientContent = wordCount >= minWords;
      
      setHasContent(hasSufficientContent);
      
      if (!hasSufficientContent) {
        // console.log(`Insufficient content for ads: ${wordCount} words (minimum: ${minWords})`);
        setAdStatus('no-content');
      }
    };
    
    // Check content after a delay to ensure page is loaded
    const timer = setTimeout(checkContent, 1000);
    return () => clearTimeout(timer);
  }, [pageType]);

  useEffect(() => {
    // Don't load ads if not approved or no content
    if (!isAdSenseApproved || !hasContent) return;
    
    // Check if container is wide enough for ads
    if (adRef.current) {
      const containerWidth = adRef.current.offsetWidth;
      if (containerWidth < 320) {
        console.log(`Container too narrow for ads: ${containerWidth}px (minimum: 320px)`);
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
                  console.log('Ad successfully loaded and filled');
                } else if (status === 'unfilled' || height < 50) {
                  setAdStatus('unfilled');
                  setAdError('No ads available');
                  console.log('Ad space unfilled or too small');
                }
              }
            };
            
            // Check status multiple times with increasing delays
            setTimeout(checkAdStatus, 1000);
            setTimeout(checkAdStatus, 3000);
            setTimeout(checkAdStatus, 5000);
          }
        }
      } catch (error) {
        console.error("AdSense loading error:", error);
        setAdError(error instanceof Error ? error.message : "Unknown AdSense error");
        setAdStatus('error');
      }
    };

    // Delay ad loading to ensure DOM is ready and content is verified
    const timer = setTimeout(loadAd, 2000);

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

  // Don't render anything if AdSense is not approved
  if (!isAdSenseApproved) {
    return null;
  }

  // Don't show anything if no content or ad errors
  if (!hasContent || adError || adStatus === 'unfilled' || adStatus === 'no-content' || adStatus === 'container-too-small') {
    return null;
  }

  return (
    <div className={className} style={{ minHeight: 280 }}>
      <Script
        id="adsense-script"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4588308927468413"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('AdSense script loaded successfully');
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
        style={{ display: "block", textAlign: "center", minHeight: 250 }}
        data-ad-client="ca-pub-4588308927468413"
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