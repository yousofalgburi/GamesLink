import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { db } from '@/lib/db'
import index from '@/lib/pinecone'
import { SteamGame } from '@prisma/client'
import OpenAI from 'openai'
import { z } from 'zod'

export async function GET(req: Request) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    async function getSearchQueryEmbedding(search: string): Promise<any> {
        const embedding = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: `${search}`,
            encoding_format: 'float',
        })

        return embedding.data[0].embedding.slice(0, 384)
    }

    const requestBody = new URL(req.url)

    try {
        let games: SteamGame[] = []
        let totalGames = 0
        let indexQuery = {}

        const { page, search, genres, categories, sort } = z
            .object({
                page: z.number(),
                search: z.string(),
                genres: z.string(),
                categories: z.string(),
                sort: z.string(),
            })
            .parse({
                page: Number(requestBody.searchParams.get('page')) || 1,
                search: requestBody.searchParams.get('search') || '',
                genres: requestBody.searchParams.get('genres') || '',
                categories: requestBody.searchParams.get('categories') || '',
                sort: requestBody.searchParams.get('sort') || 'popularity',
            })

        if (page > 1 && search !== '') {
            return new Response(JSON.stringify({ games: [] }))
        }

        const genresArray = genres.length ? genres.split(',') : []
        const categoriesArray = categories.length ? categories.split(',') : []

        const sortArray = sort.split('-')
        const orderBy = { [sortArray[0] === 'popularity' ? 'voteCount' : sortArray[0]]: sortArray[1] }
        let limit = INFINITE_SCROLL_PAGINATION_RESULTS

        if (search) {
            const queryEmbedding = await getSearchQueryEmbedding(search)

            const queryResult = await index.query({
                vector: queryEmbedding,
                topK: 25,
                includeMetadata: true,
            })

            totalGames = queryResult.matches.length

            const gamesNames = queryResult.matches.map((r) => r.metadata && r.metadata.name)

            indexQuery = { in: gamesNames }
        }

        games = await db.steamGame.findMany({
            include: {
                votes: true,
            },
            where: {
                name: search ? indexQuery : undefined,
                AND: [
                    genresArray.length
                        ? {
                              genres: {
                                  hasEvery: genresArray,
                              },
                          }
                        : {},
                    categoriesArray.length
                        ? {
                              categories: {
                                  hasEvery: categoriesArray,
                              },
                          }
                        : {},
                ],
            },
            take: search ? undefined : limit,
            skip: search ? undefined : (page - 1) * limit,
            orderBy: [
                {
                    ...orderBy,
                },
                {
                    id: 'desc',
                },
            ],
        })

        if (!search) {
            totalGames = await db.steamGame.count({
                where: {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                    AND: [
                        genresArray.length
                            ? {
                                  genres: {
                                      hasEvery: genresArray,
                                  },
                              }
                            : {},
                        categoriesArray.length
                            ? {
                                  categories: {
                                      hasEvery: categoriesArray,
                                  },
                              }
                            : {},
                    ],
                },
            })
        }

        return new Response(JSON.stringify({ games: games, totalGames }))
    } catch (error: any) {
        return new Response(error, { status: 500 })
    }
}
