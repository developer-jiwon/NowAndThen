/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supabase functions 폴더를 빌드에서 제외
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // TypeScript 체크에서 supabase functions 제외
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint 에러도 확인
  eslint: {
    ignoreDuringBuilds: false,
  },
  // PWA 헤더 최적화
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/sw-unified.js',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
