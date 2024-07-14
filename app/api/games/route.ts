import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'

export async function GET(req: Request) {
	const requestBody = new URL(req.url)
	try {
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

		const whereCondition: Prisma.ProcessedGameWhereInput = {
			type: 'game',
			name: search ? { contains: search } : undefined,
			genres: genresArray.length ? { some: { description: { in: genresArray } } } : undefined,
			categories: categoriesArray.length ? { some: { description: { in: categoriesArray } } } : undefined,
			NOT: [
				{
					categories: {
						some: {
							description: {
								equals: 'Sex',
							},
						},
					},
				},
				{
					genres: {
						some: {
							description: {
								equals: 'Sex',
							},
						},
					},
				},
				{
					shortDescription: {
						contains: 'Nude',
					},
				},
				{
					name: {
						contains: 'Nude',
					},
				},
				{
					OR: [
						{ name: { contains: 'sex' } },
						{ name: { contains: 'Sex' } },
						{ name: { contains: 'NSFW' } },
						{ name: { contains: 'nsfw' } },
						{ name: { contains: 'porn' } },
						{ name: { contains: 'Porn' } },
						{ name: { contains: 'hentai' } },
						{ name: { contains: 'Hentai' } },
						{ name: { contains: 'nudity' } },
						{ name: { contains: 'Nudity' } },
					],
				},
			],
		}

		const [games, totalGames] = await Promise.all([
			db.processedGame.findMany({
				where: whereCondition,
				orderBy: [{ [sortArray[0] === 'popularity' ? 'voteCount' : sortArray[0]]: sortArray[1] }, { id: 'desc' }],
				take: limit,
				skip: (page - 1) * limit,
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
					genres: true,
					categories: true,
					voteCount: true,
					votes: true,
				},
			}),
			db.processedGame.count({ where: whereCondition }),
		])

		return new Response(JSON.stringify({ games: games, totalGames }))
	} catch (error: unknown) {
		console.log(error)
		if (error instanceof Error) {
			return new Response(JSON.stringify({ error: error.message }), { status: 500 })
		}
		return new Response(JSON.stringify({ error: 'Unknown error' }), { status: 500 })
	}
}
