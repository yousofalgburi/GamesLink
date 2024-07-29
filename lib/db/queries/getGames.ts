import { sql, and, or, desc, asc, type SQL, arrayContains, eq } from 'drizzle-orm'
import { gameVotes, processedGames } from '@/lib/db/schema'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { z } from 'zod'
import { db } from '@/lib/db/index'
import type { Session } from 'next-auth'

interface SearchParams {
	page: number
	search: string
	searchOption: string
	genres: string
	categories: string
	sort: string
}

const searchParamsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	search: z.string().default(''),
	searchOption: z.string().default(''),
	genres: z.string().default(''),
	categories: z.string().default(''),
	sort: z.string().default('popularity-desc'),
})

const exclusionKeywords = ['sex', 'nude', 'nsfw', 'porn', 'hentai', 'adult', 'furry', 'slave']

export const getGames = async (searchParams: SearchParams, session?: Session | null) => {
	const preparedQuery = db
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
		.leftJoin(gameVotes, and(eq(gameVotes.gameId, processedGames.id), eq(gameVotes.userId, sql.placeholder('userId'))))
		.where(
			and(
				sql`${processedGames.type} = 'game'`,
				sql`NOT (${or(
					...exclusionKeywords.flatMap((keyword) => [
						sql`${processedGames.name} ilike ${sql.placeholder('exclusionPattern')}`,
						sql`${processedGames.shortDescription} ilike ${sql.placeholder('exclusionPattern')}`,
					]),
				)})`,
				sql.placeholder('searchCondition'),
				sql.placeholder('genreCondition'),
				sql.placeholder('categoryCondition'),
			),
		)
		.limit(INFINITE_SCROLL_PAGINATION_RESULTS)
		.offset(sql.placeholder('offset'))

	const preparedQueries = {
		'popularity-desc': preparedQuery.orderBy(desc(processedGames.voteCount)).prepare('get_games_popularity_desc'),
		'popularity-asc': preparedQuery.orderBy(asc(processedGames.voteCount)).prepare('get_games_popularity_asc'),
		'name-desc': preparedQuery.orderBy(desc(processedGames.name)).prepare('get_games_name_desc'),
		'name-asc': preparedQuery.orderBy(asc(processedGames.name)).prepare('get_games_name_asc'),
		'releaseDate-desc': preparedQuery.orderBy(desc(processedGames.releaseDate)).prepare('get_games_releaseDate_desc'),
		'releaseDate-asc': preparedQuery.orderBy(asc(processedGames.releaseDate)).prepare('get_games_releaseDate_asc'),
	}

	const countQuery = db
		.select({ count: sql<number>`count(*)` })
		.from(processedGames)
		.where(
			and(
				sql`${processedGames.type} = 'game'`,
				sql`NOT (${or(
					...exclusionKeywords.flatMap((keyword) => [
						sql`${processedGames.name} ilike ${sql.placeholder('exclusionPattern')}`,
						sql`${processedGames.shortDescription} ilike ${sql.placeholder('exclusionPattern')}`,
					]),
				)})`,
				sql.placeholder('searchCondition'),
				sql.placeholder('genreCondition'),
				sql.placeholder('categoryCondition'),
			),
		)
		.prepare('get_games_count')

	try {
		const { page, search, genres, categories, sort } = searchParamsSchema.parse(searchParams)

		const limit = INFINITE_SCROLL_PAGINATION_RESULTS
		const offset = (page - 1) * limit

		const genresArray = genres ? genres.split(',') : []
		const categoriesArray = categories ? categories.split(',') : []

		const whereConditions: SQL[] = [
			eq(processedGames.type, 'game'),
			...exclusionKeywords.flatMap((keyword) => [
				sql`${processedGames.name} not ilike ${`%${keyword}%`}`,
				sql`${processedGames.shortDescription} not ilike ${`%${keyword}%`}`,
			]),
		]

		if (search) {
			whereConditions.push(sql`
                (setweight(to_tsvector('english', ${processedGames.name}), 'A') ||
                 setweight(to_tsvector('english', ${processedGames.shortDescription}), 'B'))
                @@ plainto_tsquery('english', ${search})
              `)
		}

		if (genresArray.length > 0) {
			whereConditions.push(arrayContains(processedGames.genres, genresArray))
		}

		if (categoriesArray.length > 0) {
			whereConditions.push(arrayContains(processedGames.categories, categoriesArray))
		}

		const [sortField, sortOrder] = sort.split('-') as [string, 'asc' | 'desc']
		let orderBy: SQL
		if (sortField === 'popularity') {
			orderBy = sortOrder === 'asc' ? asc(processedGames.voteCount) : desc(processedGames.voteCount)
		} else if (sortField === 'name') {
			orderBy = sortOrder === 'asc' ? asc(processedGames.name) : desc(processedGames.name)
		} else {
			orderBy = sortOrder === 'asc' ? asc(processedGames.releaseDate) : desc(processedGames.releaseDate)
		}

		const gamesQuery = db
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
			.where(and(...whereConditions))
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset)

		const games = await gamesQuery
		const countQuery = db
			.select({ count: sql<number>`cast(count(*) as integer)` })
			.from(processedGames)
			.where(and(...whereConditions))
		const countResult = await countQuery
		const totalGames = countResult[0].count

		return { games, totalGames }
	} catch (error) {
		console.error('Error in getGames:', error)
		throw error
	}
}
