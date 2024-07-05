import GameCard from '@/components/GameCard'
import RecommendedGames from '@/components/RecommendedGames'
import { VoteType } from '@/constants/enums'
import { getAuthSession } from '@/lib/auth'
import type { ExtendedGame } from '@/types/db'

export default async function Page() {
	const session = await getAuthSession()
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
						const votesAmt = game.votes.reduce((acc, vote) => {
							if (vote.type === VoteType.UP) return acc + 1
							if (vote.type === VoteType.DOWN) return acc - 1
							return acc
						}, 0)

						const currentVote = game.votes.find((vote) => vote.userId === session?.user.id)

						return <GameCard key={game.id} votesAmt={votesAmt} currentVote={currentVote?.type as VoteType} game={game} />
					})}
				</div>
			</div>
		</div>
	)
}
