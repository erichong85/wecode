import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 生产环境优化
    output: 'standalone', // 启用 standalone 模式，减小部署体积

    // 图片优化
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    // 性能优化
    compress: true, // 启用 gzip 压缩

    // 可选：如果需要支持旧版浏览器
    // reactStrictMode: true,
};

export default nextConfig;
