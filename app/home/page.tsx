import GameFeed from '@/components/GameFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import index from '@/lib/pinecone'
import { ExtendedGame } from '@/types/db'
import axios from 'axios'
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

    let url = ''
    if (process.env.NODE_ENV === 'development') {
        url = 'http://localhost:3000'
    }

    const { data } = await axios.get(
        `${url}/api/games?page=${searchParamsObj.page}&search=${searchParamsObj.search}&genres=${searchParamsObj.genres}&categories=${searchParamsObj.categories}&sort=${searchParamsObj.sort}`
    )

    if (data.games) {
        games = data.games
        totalGames = data.totalGames
    }

    console.log(data)

    return (
        <GameFeed initGames={games} initTotalGames={totalGames} searchParamsObj={searchParamsObj} session={session} />
    )
}
