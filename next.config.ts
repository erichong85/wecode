import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 生产环境优化
    // output: 'standalone', // 已注释掉：在常规（非 Docker）服务器上不使用 standalone 模式以便支持 npm start

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
