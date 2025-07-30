/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.VERCEL_GIT_COMMIT_REF === 'main' 
      ? 'https://api.aws-services.com'
      : process.env.VERCEL_GIT_COMMIT_REF === 'test'
      ? 'https://api-test.aws-services.com'
      : 'https://api-dev.aws-services.com'
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;