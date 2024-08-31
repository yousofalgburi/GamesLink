import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	const baseUrl = 'https://gameslink.app'

	return {
		rules: {
			userAgent: '*',
			allow: ['/', '/home', '/game/*', '/my-games', '/link-room/new'],
			disallow: [],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}
