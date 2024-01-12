/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dkstatics-public.digikala.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
