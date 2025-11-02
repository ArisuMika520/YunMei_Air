const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  runtimeCaching: [
    {
        urlPattern: ({ url }) => {
          const pathname = url.pathname;
          return pathname === '/' || 
                 pathname === '/login' || 
                 pathname === '/locks' || 
                 pathname.startsWith('/lock/') || 
                 pathname.startsWith('/settings');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 7 天
          }
        }
      },
      {
        urlPattern: /\/_next\/(static|image).*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
          }
        }
      },
      {
        urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'font-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 1 年
          }
        }
      },
      {
        urlPattern: /^https?:\/\/[^/]+\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 5,
        expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60 // 24 小时
          }
        }
      },
      {
        urlPattern: /^https?:\/\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'external-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 // 24 小时
          }
      }
    }
  ]
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
