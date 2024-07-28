import { sql, and, or, desc, asc, type SQL, arrayContains, eq } from 'drizzle-orm'
import { gameVotes, processedGames } from '@/lib/db/schema'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { z } from 'zod'
import { db } from '@/lib/db/index'
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

		const exclusionConditions = [
			sql`${processedGames.name} ilike '%sex%'`,
			sql`${processedGames.name} ilike '%nude%'`,
			sql`${processedGames.name} ilike '%nsfw%'`,
			sql`${processedGames.name} ilike '%porn%'`,
			sql`${processedGames.name} ilike '%hentai%'`,
			sql`${processedGames.name} ilike '%adult%'`,
			sql`${processedGames.name} ilike '%furry%'`,
			sql`${processedGames.name} ilike '%slave%'`,
			sql`${processedGames.shortDescription} ilike '%sex%'`,
			sql`${processedGames.shortDescription} ilike '%nude%'`,
			sql`${processedGames.shortDescription} ilike '%nsfw%'`,
			sql`${processedGames.shortDescription} ilike '%porn%'`,
			sql`${processedGames.shortDescription} ilike '%hentai%'`,
			sql`${processedGames.shortDescription} ilike '%adult%'`,
			sql`${processedGames.shortDescription} ilike '%furry%'`,
			sql`${processedGames.shortDescription} ilike '%slave%'`,
		]
		conditions.push(sql`NOT (${or(...exclusionConditions)})`)

		conditions.push(sql`${processedGames.type} = 'game'`)

		const whereClause = and(...conditions)

		let primaryOrderByClause: SQL
		if (sortField === 'popularity') {
			primaryOrderByClause = sortOrder === 'asc' ? asc(processedGames.voteCount) : desc(processedGames.voteCount)
		} else if (sortField === 'name') {
			primaryOrderByClause = sortOrder === 'asc' ? asc(processedGames.name) : desc(processedGames.name)
		} else {
			primaryOrderByClause = sortOrder === 'asc' ? asc(processedGames.releaseDate) : desc(processedGames.releaseDate)
		}

		const secondaryOrderByClause = sortOrder === 'asc' ? asc(processedGames.steamAppid) : desc(processedGames.steamAppid)

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

		const games = await query

		const countResult = await db.select({ count: sql<number>`count(*)` }).from(processedGames).where(whereClause)
		const totalGames = countResult[0].count

		return { games, totalGames }
	} catch (error) {
		console.error(error)
		throw error
	}
}