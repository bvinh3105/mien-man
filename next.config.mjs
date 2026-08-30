/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  eslint: {
    // Không để ESLint warnings chặn build trên CI/Cloudflare
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
