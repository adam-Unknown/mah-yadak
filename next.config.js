/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xer0.storage.iran.liara.space",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
