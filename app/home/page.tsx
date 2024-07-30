import GameFeed from '@/components/GameFeed'
import { auth } from '@/auth'
import { z } from 'zod'
import { getGames } from '@/db/queries/getGames'

export default async function Page({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined }
}) {
	const session = await auth()
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let games: any[] = []
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

	searchParamsObj.genres = searchParamsObj.genres
		.split(',')
		.filter((genre) => genre !== '')
		.join(',')

	searchParamsObj.categories = searchParamsObj.categories
		.split(',')
		.filter((category) => category !== '')
		.join(',')

	const result = await getGames(searchParamsObj, session)

	if (result.games) {
		games = result.games
		totalGames = result.totalGames
	}

	return <GameFeed initGames={games} initTotalGames={totalGames} searchParamsObj={searchParamsObj} session={session} />
}
