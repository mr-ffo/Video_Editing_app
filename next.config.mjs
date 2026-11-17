/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@remotion/renderer"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
