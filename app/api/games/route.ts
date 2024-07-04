import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { db } from '@/lib/db'
import index from '@/lib/pinecone'
import type { GameView } from '@/types/db'
import OpenAI from 'openai'
import { z } from 'zod'

export async function GET(req: Request) {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

	async function getSearchQueryEmbedding(search: string): Promise<number[]> {
		const embedding = await openai.embeddings.create({
			model: 'text-embedding-ada-002',
			input: `${search}`,
			encoding_format: 'float',
		})

		return embedding.data[0].embedding.slice(0, 384)
	}
	const requestBody = new URL(req.url)

	try {
		let games: GameView[] = []
		let totalGames = 0
		let indexQuery = {}

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

		if (page > 1 && search !== '' && searchOption === 'ai-search') {
			return new Response(JSON.stringify({ games: [] }))
		}

		const genresArray = genres.length ? genres.split(',') : []
		const categoriesArray = categories.length ? categories.split(',') : []

		const sortArray = sort.split('-')
		const orderBy = { [sortArray[0] === 'popularity' ? 'voteCount' : sortArray[0]]: sortArray[1] }
		const limit = INFINITE_SCROLL_PAGINATION_RESULTS

		if (search) {
			if (searchOption === 'ai-search') {
				const queryEmbedding = await getSearchQueryEmbedding(search)

				const queryResult = await index.query({
					vector: queryEmbedding,
					topK: 25,
					includeMetadata: true,
				})

				totalGames = queryResult.matches.length

				const gamesNames = queryResult.matches.map((r) => r.metadata?.name)

				indexQuery = {
					name: {
						in: gamesNames,
					},
				}
			} else if (searchOption === 'smart-text') {
				const searchWords = search.split(' ')

				indexQuery = {
					AND: searchWords.map((word) => ({
						OR: [{ name: { contains: word, mode: 'insensitive' } }, { shortDescription: { contains: word, mode: 'insensitive' } }],
					})),
				}
			}
		}

		const processedGames = await db.processedGame.findMany({
			select: {
				id: true,
				appId: true,
				name: true,
				shortDescription: true,
				headerImage: true,
				requiredAge: true,
				isFree: true,
				releaseDate: true,
				developers: true,
				categories: { select: { description: true } },
				genres: { select: { description: true } },
				ratings: { select: { id: true } },
			},
			where: {
				AND: [
					{ type: 'game', requiredAge: { equals: 0 } },
					indexQuery,
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
			take: search && searchOption === 'ai-search' ? undefined : limit,
			skip: search && searchOption === 'ai-search' ? undefined : (page - 1) * limit,
			orderBy:
				sortArray[0] !== 'popularity'
					? [
							{
								...orderBy,
							},
							{
								id: 'desc',
							},
						]
					: undefined,
		})

		if (!search || searchOption === 'smart-text') {
			totalGames = await db.processedGame.count({
				where: {
					AND: [
						{ type: 'game', requiredAge: { equals: 0 } },
						indexQuery,
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
		}

		const gameInteractions = await db.gameInteraction.findMany({
			where: {
				appId: {
					in: processedGames.map((game) => game.appId),
				},
			},
			include: {
				votes: true,
				comments: true,
			},
		})

		const gameInteractionMap = new Map(gameInteractions.map((gi) => [gi.appId, gi]))

		games = processedGames.map((game) => {
			const interaction = gameInteractionMap.get(game.appId) || { voteCount: 0, votes: [], comments: [] }
			return {
				id: game.id,
				steamAppId: game.appId,
				name: game.name,
				shortDescription: game.shortDescription,
				headerImage: game.headerImage,
				requiredAge: game.requiredAge,
				isFree: game.isFree,
				releaseDate: game.releaseDate?.date ? new Date(game.releaseDate.date) : null,
				developers: game.developers,
				categories: game.categories.map((c) => c.description),
				genres: game.genres.map((g) => g.description),
				voteCount: interaction.voteCount,
				votes: interaction.votes,
				comments: interaction.comments,
			}
		})

		if (sortArray[0] === 'popularity') {
			games.sort((a, b) => (sortArray[1] === 'desc' ? b.voteCount - a.voteCount : a.voteCount - b.voteCount))
		}

		return new Response(JSON.stringify({ games: games, totalGames }))
	} catch (error: unknown) {
		console.log(error)
		if (error instanceof Error) {
			return new Response(JSON.stringify({ error: error.message }), { status: 500 })
		}
		return new Response(JSON.stringify({ error: 'Unknown error' }), { status: 500 })
	}
}
