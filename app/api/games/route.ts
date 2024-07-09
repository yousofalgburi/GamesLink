import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { db } from '@/lib/db'
import index from '@/lib/pinecone'
import type { ExtendedGame } from '@/types/db'
import OpenAI from 'openai'
import { z } from 'zod'

export async function GET(req: Request) {
	const requestBody = new URL(req.url)

	try {
		let games: ExtendedGame[] = []
		let totalGames = 0

		const { page, search, searchOption, genres, categories, sort } = z
			.object({
				page: z.number(),
				search: z.string(),
				searchOption: z.string(),
				genres: z.string(),
				categories: z.string(),
				sort: z.string(),
			})
			.parse({
				page: Number(requestBody.searchParams.get('page')) || 1,
				search: requestBody.searchParams.get('search') || '',
				searchOption: requestBody.searchParams.get('searchOption') || '',
				genres: requestBody.searchParams.get('genres') || '',
				categories: requestBody.searchParams.get('categories') || '',
				sort: requestBody.searchParams.get('sort') || 'popularity',
			})

		const genresArray = genres?.length ? genres.split(',') : []
		const categoriesArray = categories?.length ? categories.split(',') : []
		const sortArray = sort.split('-')
		const limit = INFINITE_SCROLL_PAGINATION_RESULTS
		const searchWords = search.split(' ')

		games = await db.processedGame.findMany({
			select: {
				id: true,
				steamAppid: true,
				name: true,
				shortDescription: true,
				headerImage: true,
				requiredAge: true,
				isFree: true,
				releaseDate: true,
				developers: true,
				categories: true,
				genres: true,
				voteCount: true,
				votes: true,
			},
			where: {
				type: 'game',
				requiredAge: 0,
				name: search ? { contains: search } : undefined,
				AND: [
					genresArray.length
						? {
								genres: {
									some: {
										description: {
											in: genresArray,
										},
									},
								},
							}
						: {},
					categoriesArray.length
						? {
								categories: {
									some: {
										description: {
											in: categoriesArray,
										},
									},
								},
							}
						: {},
				],
			},
			orderBy: [{ [sortArray[0] === 'popularity' ? 'voteCount' : sortArray[0]]: sortArray[1] }, { id: 'desc' }],
			take: limit,
			skip: (page - 1) * limit,
		})

		totalGames = await db.processedGame.count({
			where: {
				type: 'game',
				requiredAge: 0,
				name: search ? { contains: search } : undefined,
				AND: [
					genresArray.length
						? {
								genres: {
									some: {
										description: {
											in: genresArray,
										},
									},
								},
							}
						: {},
					categoriesArray.length
						? {
								categories: {
									some: {
										description: {
											in: categoriesArray,
										},
									},
								},
							}
						: {},
				],
			},
		})

		return new Response(JSON.stringify({ games: games, totalGames }))
	} catch (error: unknown) {
		console.log(error)
		if (error instanceof Error) {
			return new Response(JSON.stringify({ error: error.message }), { status: 500 })
		}
		return new Response(JSON.stringify({ error: 'Unknown error' }), { status: 500 })
	}
}
