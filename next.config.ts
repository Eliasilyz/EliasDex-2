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
            "img-src 'self' https://cdn.myanimelist.net https://s4.anilist.co https://i.ytimg.com https://files.catbox.moe data: blob:",
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
