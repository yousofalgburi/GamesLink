import GameFeed from '@/components/GameFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import index from '@/lib/pinecone'
import { ExtendedGame } from '@/types/db'
import { z } from 'zod'

export default async function Page({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    let session = await getAuthSession()
    let games: ExtendedGame[] = []
    let totalGames = 0
    let indexQuery = {}

    const searchParamsObj = z
        .object({
            page: z.number(),
            search: z.string(),
            genres: z.string(),
            categories: z.string(),
            sort: z.string(),
        })
        .parse({
            page: searchParams?.page || 1,
            search: searchParams?.search || '',
            genres: searchParams?.genres || '',
            categories: searchParams?.categories || '',
            sort: searchParams?.sort || 'popularity-desc',
        })

    const genresArray = searchParamsObj.genres.length ? searchParamsObj.genres.split(',') : []
    const categoriesArray = searchParamsObj.categories.length ? searchParamsObj.categories.split(',') : []

    const sortArray = searchParamsObj.sort.split('-')
    const orderBy = { [sortArray[0] === 'popularity' ? 'voteCount' : sortArray[0]]: sortArray[1] }
    let limit = INFINITE_SCROLL_PAGINATION_RESULTS

    if (searchParamsObj.search) {
        const queryEmbedding = await getSearchQueryEmbedding(searchParamsObj.search)

        let tempGames = await db.steamGame.findMany({
            where: {
                name: {
                    contains: searchParamsObj.search,
                    mode: 'insensitive',
                },
                AND: [
                    genresArray.length
                        ? {
                              genres: {
                                  hasSome: genresArray,
                              },
                          }
                        : {},
                    categoriesArray.length
                        ? {
                              categories: {
                                  hasSome: categoriesArray,
                              },
                          }
                        : {},
                ],
            },
        })

        const queryResult = await index.query({
            vector: queryEmbedding,
            topK: (tempGames.length + 25 > 100 ? 100 : tempGames.length + 25) || 25,
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
            name: searchParamsObj.search ? indexQuery : undefined,
            AND: [
                genresArray.length
                    ? {
                          genres: {
                              hasSome: genresArray,
                          },
                      }
                    : {},
                categoriesArray.length
                    ? {
                          categories: {
                              hasSome: categoriesArray,
                          },
                      }
                    : {},
            ],
        },
        take: searchParamsObj.search ? undefined : limit,
        skip: searchParamsObj.search ? undefined : (searchParamsObj.page - 1) * limit,
        orderBy: orderBy,
    })

    if (!searchParamsObj.search) {
        totalGames = await db.steamGame.count({
            where: {
                name: {
                    contains: searchParamsObj.search,
                    mode: 'insensitive',
                },
                AND: [
                    genresArray.length
                        ? {
                              genres: {
                                  hasSome: genresArray,
                              },
                          }
                        : {},
                    categoriesArray.length
                        ? {
                              categories: {
                                  hasSome: categoriesArray,
                              },
                          }
                        : {},
                ],
            },
        })
    }

    async function getSearchQueryEmbedding(search: string): Promise<number[]> {
        const response = await fetch('https://api.embaas.io/v1/embeddings/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.EMBAAS_KEY}`,
            },
            body: JSON.stringify({
                texts: [`${search}`],
                model: 'all-MiniLM-L6-v2',
            }),
        })

        const data = await response.json()

        return data.data[0].embedding
    }

    return (
        <GameFeed initGames={games} initTotalGames={totalGames} searchParamsObj={searchParamsObj} session={session} />
    )
}
