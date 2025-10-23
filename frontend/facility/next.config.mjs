/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 정적 파일로 빌드
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // rewrites는 정적 export와 호환되지 않으므로 제거
  // API 호출은 클라이언트에서 직접 NEXT_PUBLIC_API_BASE_URL 사용
}

export default nextConfig
