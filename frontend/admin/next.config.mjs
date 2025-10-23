/** @type {import('next').NextConfig} */
const nextConfig = {
  // Admin은 동적 라우트가 있어 SSR 모드 사용
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // API 프록시 설정 - CORS 이슈 회피용
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/:path*`,
      },
    ]
  },
}

export default nextConfig
