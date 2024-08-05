import GameCard from '@/components/GameCard'
import RecommendedGames from '@/components/RecommendedGames'
import { auth } from '@/auth'
import type { ExtendedGame } from '@/types/db'
import { db } from '@/db'
import { gameVotes, processedGames } from '@/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { Suspense } from 'react'

export default async function Page() {
	const session = await auth()
	let games: ExtendedGame[] = []

	if (session?.user) {
		games = (await db
			.select({
				id: processedGames.id,
				steamAppid: processedGames.steamAppid,
				name: processedGames.name,
				shortDescription: processedGames.shortDescription ?? '',
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
			.leftJoin(gameVotes, and(eq(gameVotes.gameId, processedGames.id), eq(gameVotes.userId, session.user.id)))
			.where(eq(gameVotes.userId, session.user.id))
			.orderBy(desc(processedGames.voteCount))) as ExtendedGame[]
	}

	return (
		<div className='mx-auto flex min-h-[90vh] flex-col gap-10 px-16 py-6'>
			<div>
				<Suspense fallback={<div>Loading...</div>}>
					<RecommendedGames />
				</Suspense>
			</div>

			<div>
				<h1 className='pb-4 text-3xl font-bold'>Games ({games.length})</h1>
				<div className='grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
					{games.map((game, index) => {
						return <GameCard key={game.id} votesAmt={game.voteCount} currentVote={game.voteType} game={game} />
					})}
				</div>
			</div>
		</div>
	)
}
