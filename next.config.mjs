const API_URL = process.env.API_URL || 'http://127.0.0.1:8787'

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_URL}/api/:path*`,
            },
        ]
    },
}

export default nextConfig
