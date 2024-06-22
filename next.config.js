/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	images: {
		remotePatterns: [
			{
				hostname: 'cdn.akamai.steamstatic.com',
			},
			{
				hostname: 'lh3.googleusercontent.com',
			},
			{
				hostname: 'gaming-cdn.com',
			},
			{
				hostname: 'buy.thewitcher.com',
			},
		],
	},
}

module.exports = nextConfig
