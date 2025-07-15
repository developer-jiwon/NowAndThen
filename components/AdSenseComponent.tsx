import Script from "next/script";

export default function AdSenseComponent() {
  return (
    <>
      <Script
        id="adsense-script"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        crossOrigin="anonymous"
      />
      <ins className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client="ca-pub-XXXXXXX" // ← 본인 코드로 교체
        data-ad-slot="YYYYYYY"           // ← 본인 코드로 교체
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id="adsense-init">{`
        (adsbygoogle = window.adsbygoogle || []).push({});
      `}</Script>
    </>
  );
} 