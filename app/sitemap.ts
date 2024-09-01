import type { MetadataRoute } from 'next'
import { db } from '@/db'
import { processedGames } from '@/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = 'https://gameslink.app'
	const gameIds = await db
		.select({ steamAppid: processedGames.steamAppid })
		.from(processedGames)
		.where(and(eq(processedGames.nsfw, false), eq(processedGames.type, 'game')))
		.orderBy(desc(processedGames.releaseDate))
		.limit(49000)

	const gameRoutes = gameIds.map(({ steamAppid }) => ({
		url: `${baseUrl}/game/${steamAppid}`,
		lastModified: new Date(),
	}))

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily',
		},
		{
			url: `${baseUrl}/home`,
			lastModified: new Date(),
			changeFrequency: 'daily',
		},
		{
			url: `${baseUrl}/my-games`,
			lastModified: new Date(),
			changeFrequency: 'daily',
		},
		{
			url: `${baseUrl}/link-room/new`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
		},
		...gameRoutes,
	]
}
