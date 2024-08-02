import { sql } from 'drizzle-orm'
import { processedGames, gameGenres, gameCategories } from '@/db/schema'
import { db } from '@/db'

function isEnglish(text: string): boolean {
	return /^[\x20-\x7E]*$/.test(text)
}

export async function updateGenreAndCategoryCounts() {
	try {
		const genreCounts = await db
			.select({
				genre: sql<string>`unnest(${processedGames.genres})`,
				count: sql<number>`count(*)`,
			})
			.from(processedGames)
			.where(sql`${processedGames.type} = 'game'`)
			.groupBy(sql`unnest(${processedGames.genres})`)

		for (const { genre, count } of genreCounts) {
			await db
				.insert(gameGenres)
				.values({
					genre,
					gameCount: count,
					isEnglish: isEnglish(genre),
				})
				.onConflictDoUpdate({
					target: gameGenres.genre,
					set: {
						gameCount: count,
						isEnglish: isEnglish(genre),
					},
				})
		}

		console.log(`Updated ${genreCounts.length} genres`)

		const categoryCounts = await db
			.select({
				category: sql<string>`unnest(${processedGames.categories})`,
				count: sql<number>`count(*)`,
			})
			.from(processedGames)
			.where(sql`${processedGames.type} = 'game'`)
			.groupBy(sql`unnest(${processedGames.categories})`)

		for (const { category, count } of categoryCounts) {
			await db
				.insert(gameCategories)
				.values({
					category,
					gameCount: count,
					isEnglish: isEnglish(category),
				})
				.onConflictDoUpdate({
					target: gameCategories.category,
					set: {
						gameCount: count,
						isEnglish: isEnglish(category),
					},
				})
		}

		console.log(`Updated ${categoryCounts.length} categories`)

		return {
			updatedGenres: genreCounts.length,
			updatedCategories: categoryCounts.length,
		}
	} catch (error) {
		console.error('Error updating genre and category counts:', error)
		throw error
	}
}

export async function POST(req: Request) {
	try {
		const result = await updateGenreAndCategoryCounts()
		return Response.json({ message: 'Genre and category counts updated', ...result })
	} catch (error) {
		console.error(error)
		return Response.json({ error: 'An error occurred while updating counts' }, { status: 500 })
	}
}
