import type { MetadataRoute } from 'next'
import { db } from '@/db'
import { processedGames } from '@/db/schema'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = 'https://gameslink.app'
	const gameIds = await db.select({ steamAppid: processedGames.steamAppid }).from(processedGames)

	const gameRoutes = gameIds.map(({ steamAppid }) => ({
		url: `${baseUrl}/game/${steamAppid}`,
		lastModified: new Date(),
	}))

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
		},
		{
			url: `${baseUrl}/home`,
			lastModified: new Date(),
		},
		{
			url: `${baseUrl}/my-games`,
			lastModified: new Date(),
		},
		{
			url: `${baseUrl}/link-room/new`,
			lastModified: new Date(),
		},
		...gameRoutes,
	]
}
