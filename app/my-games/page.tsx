import GameCard from '@/components/GameCard'
import RecommendedGames from '@/components/RecommendedGames'
import { VoteType } from '@/constants/enums'
import { auth } from '@/auth'
import type { ExtendedGame } from '@/types/db'

export default async function Page() {
	const session = await auth()
	const games: ExtendedGame[] = []

	// // Check user logged in
	// if (session?.user) {
	// 	games = (await db.steamGame.findMany({
	// 		where: {
	// 			votes: {
	// 				some: {
	// 					userId: session.user.id,
	// 				},
	// 			},
	// 		},
	// 		include: {
	// 			votes: {
	// 				where: {
	// 					userId: session.user.id,
	// 				},
	// 			},
	// 		},
	// 		orderBy: {
	// 			voteCount: 'desc',
	// 		},
	// 	})) as ExtendedGame[]
	// } else {
	// 	games = []
	// }

	return (
		<div className='mx-auto flex min-h-[90vh] flex-col gap-10 px-16 py-6'>
			<div>
				<RecommendedGames />
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
