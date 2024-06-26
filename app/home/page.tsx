import GameFeed from '@/components/GameFeed'
import { getAuthSession } from '@/lib/auth'
import type { ExtendedGame } from '@/types/db'
import axios from 'axios'
import { z } from 'zod'

export default async function Page({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	const session = await getAuthSession()
	let games: ExtendedGame[] = []
	let totalGames = 0

	const searchParamsObj = z
		.object({
			page: z.number(),
			search: z.string(),
			searchOption: z.string(),
			genres: z.string(),
			categories: z.string(),
			sort: z.string(),
		})
		.parse({
			page: searchParams?.page || 1,
			search: searchParams?.search || '',
			searchOption: searchParams?.searchOption || '',
			genres: searchParams?.genres || '',
			categories: searchParams?.categories || '',
			sort: searchParams?.sort || 'popularity-desc',
		})

	let url = ''
	if (process.env.NODE_ENV === 'development') {
		url = 'http://localhost:3000'
	} else {
		url = 'https://gameslink.app'
	}

	searchParamsObj.genres = searchParamsObj.genres
		.split(',')
		.filter((genre) => genre !== '')
		.join(',')

	searchParamsObj.categories = searchParamsObj.categories
		.split(',')
		.filter((category) => category !== '')
		.join(',')

	const { data } = await axios.get(
		`${url}/api/games?page=${searchParamsObj.page}&search=${searchParamsObj.search}&searchOption=${searchParamsObj.searchOption}&genres=${searchParamsObj.genres}&categories=${searchParamsObj.categories}&sort=${searchParamsObj.sort}`,
	)

	if (data.games) {
		games = data.games
		totalGames = data.totalGames
	}

	return <GameFeed initGames={games} initTotalGames={totalGames} searchParamsObj={searchParamsObj} session={session} />
}
