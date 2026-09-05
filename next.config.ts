import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' https: http: data: blob:",
            "font-src 'self' 'unsafe-inline'",
            "connect-src 'self' https://graphql.anilist.co https://api.myanimelist.net wss://*.pusher.co wss://*.pusher.com https://*.pusher.com",
            "media-src 'self' blob: https://anime4up.* https://consumet.*",
          ].join('; '),
        },
      ],
    },
  ],
};

export default nextConfig;
