/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'cdn.akamai.steamstatic.com',
            },
            {
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    reactStrictMode: false,
}

module.exports = nextConfig
