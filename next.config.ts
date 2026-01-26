import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
};

export default nextConfig;
