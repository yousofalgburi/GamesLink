import { getAuthSession } from '@/lib/auth'
import type { ProcessedGame, GameInteraction, Vote } from '@prisma/client'
import { notFound } from 'next/navigation'
import GameVoteClient from './GameVoteClient'
import { db } from '@/lib/db'
import type { VoteType } from '@/constants/enums'

interface GameVoteServerProps {
	gameId: string
	initialVotesAmt?: number
	initialVote?: Vote['type'] | null
	getData?: () => Promise<{ game: ProcessedGame | null; gameInteraction: GameInteraction | null }>
}

const GameVoteServer = async ({ gameId, initialVotesAmt, initialVote, getData }: GameVoteServerProps) => {
	const session = await getAuthSession()

	let _votesAmt = 0
	let _currentVote: Vote['type'] | null | undefined = undefined

	if (getData) {
		const { game, gameInteraction } = await getData()
		if (!game) return notFound()

		_votesAmt = gameInteraction?.voteCount ?? 0

		if (gameInteraction && session?.user?.id) {
			const userVote = await db.vote.findFirst({
				where: {
					gameId: gameInteraction.id,
					userId: session.user.id,
				},
			})
			_currentVote = userVote?.type
		}
	} else {
		_votesAmt = initialVotesAmt ?? 0
		_currentVote = initialVote
	}

	return <GameVoteClient gameId={gameId} initialVotesAmt={_votesAmt} initialVote={_currentVote as VoteType} />
}

export default GameVoteServer
