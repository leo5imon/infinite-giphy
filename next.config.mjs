/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.media",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "media-src 'self' https://fal.media; img-src 'self' https://fal.media data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
