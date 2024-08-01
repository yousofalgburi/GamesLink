import { sql, and, or, desc, asc, type SQL, arrayContains, eq, ilike } from 'drizzle-orm'
import { gameVotes, processedGames } from '@/db/schema'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { z } from 'zod'
import { db } from '@/db'
import type { Session } from 'next-auth'

interface searchParams {
	page: number
	search: string
	searchOption: string
	genres: string
	categories: string
	sort: string
}

export const getGames = async (searchParams: searchParams, session?: Session | null) => {
	try {
		const { page, search, searchOption, genres, categories, sort } = z
			.object({
				page: z.coerce.number().int().positive().default(1),
				search: z.string().default(''),
				searchOption: z.string().default(''),
				genres: z.string().default(''),
				categories: z.string().default(''),
				sort: z.string().default('popularity-desc'),
			})
			.parse(searchParams)

		const limit = INFINITE_SCROLL_PAGINATION_RESULTS
		const offset = (page - 1) * limit

		const genresArray = genres ? genres.split(',') : []
		const categoriesArray = categories ? categories.split(',') : []
		const [sortField, sortOrder] = sort.split('-') as [string, 'asc' | 'desc']

		const conditions: SQL[] = []

		if (search) {
			conditions.push(
				sql`(
                    setweight(to_tsvector('english', ${processedGames.name}), 'A') ||
                    setweight(to_tsvector('english', ${processedGames.shortDescription}), 'B')
                ) @@ plainto_tsquery('english', ${search})`,
			)
		}

		if (genresArray.length > 0) {
			conditions.push(arrayContains(processedGames.genres, genresArray))
		}
		if (categoriesArray.length > 0) {
			conditions.push(arrayContains(processedGames.categories, categoriesArray))
		}

		conditions.push(sql`${processedGames.type} = 'game'`)
		conditions.push(sql`${processedGames.nsfw} = false`)

		const whereClause = and(...conditions)

		let primaryOrderByClause: SQL
		if (sortField === 'popularity') {
			primaryOrderByClause = sortOrder === 'asc' ? asc(processedGames.voteCount) : desc(processedGames.voteCount)
		} else if (sortField === 'name') {
			primaryOrderByClause = sortOrder === 'asc' ? asc(processedGames.name) : desc(processedGames.name)
		} else {
			primaryOrderByClause = sortOrder === 'asc' ? asc(processedGames.releaseDate) : desc(processedGames.releaseDate)
		}

		const secondaryOrderByClause = asc(processedGames.steamAppid)

		const query = db
			.select({
				id: processedGames.id,
				steamAppid: processedGames.steamAppid,
				name: processedGames.name,
				shortDescription: processedGames.shortDescription,
				headerImage: processedGames.headerImage,
				requiredAge: processedGames.requiredAge,
				isFree: processedGames.isFree,
				releaseDate: processedGames.releaseDate,
				developers: processedGames.developers,
				genres: processedGames.genres,
				categories: processedGames.categories,
				voteCount: processedGames.voteCount,
				voteType: gameVotes.voteType,
			})
			.from(processedGames)
			.leftJoin(gameVotes, and(eq(gameVotes.gameId, processedGames.id), eq(gameVotes.userId, session?.user?.id ?? '')))
			.where(whereClause)
			.orderBy(primaryOrderByClause, secondaryOrderByClause)
			.limit(limit)
			.offset(offset)

		const [games, totalGames] = await Promise.all([query, db.select({ count: sql<number>`count(*)` }).from(processedGames).where(whereClause)])

		return { games, totalGames: totalGames[0].count }
	} catch (error) {
		console.error(error)
		throw error
	}
}
