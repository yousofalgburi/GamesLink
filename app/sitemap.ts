import type { MetadataRoute } from 'next'
import { db } from '@/db'
import { processedGames } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = 'https://gameslink.app'
	const gameIds = await db
		.select({ steamAppid: processedGames.steamAppid })
		.from(processedGames)
		.where(and(eq(processedGames.nsfw, false), eq(processedGames.type, 'game')))
		.limit(10000)

	const gameRoutes = gameIds.map(({ steamAppid }) => ({
		url: `${baseUrl}/game/${steamAppid}`,
		lastModified: new Date(),
		priority: 0.5,
	}))

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${baseUrl}/home`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/my-games`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/link-room/new`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.6,
		},
		...gameRoutes,
	]
}
