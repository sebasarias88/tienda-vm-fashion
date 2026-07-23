import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            // Permite sensores que pide el embed de TikTok/YouTube (evita warnings de Permissions-Policy)
            key: 'Permissions-Policy',
            value:
              'accelerometer=(self "https://www.tiktok.com" "https://www.youtube.com"), gyroscope=(self "https://www.tiktok.com" "https://www.youtube.com"), clipboard-write=(self "https://www.tiktok.com" "https://www.youtube.com"), encrypted-media=(self "https://www.tiktok.com" "https://www.youtube.com"), autoplay=(self "https://www.tiktok.com" "https://www.youtube.com"), picture-in-picture=(self "https://www.tiktok.com" "https://www.youtube.com"), fullscreen=(self "https://www.tiktok.com" "https://www.youtube.com" "https://www.instagram.com")',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/mayoreo',
        destination: '/mayorista',
        permanent: true,
      },
      {
        source: '/mayoreo/:path*',
        destination: '/mayorista/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
