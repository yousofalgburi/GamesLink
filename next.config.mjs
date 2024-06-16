/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: '/api',
				destination: 'http://127.0.0.1:8787/'
			}
		]
	}
}

export default nextConfig
