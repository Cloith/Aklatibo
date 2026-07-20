import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',          // Crucial: Forces a static HTML/CSS/JS export
  images: {
    unoptimized: true,       // Prevents image breaks on mobile devices
  },
};

export default nextConfig;
