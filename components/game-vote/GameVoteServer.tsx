import { auth } from '@/auth'
import type { ProcessedGame, Vote } from '@prisma/client'
import { notFound } from 'next/navigation'
import GameVoteClient from './GameVoteClient'
import type { VoteType } from '@/constants/enums'

interface GameVoteServerProps {
	gameId: string
	initialVotesAmt?: number
	initialVote?: VoteType | null
	getData?: () => Promise<(ProcessedGame & { votes: Vote[] }) | null>
}

const GameVoteServer = async ({ gameId, initialVotesAmt, initialVote, getData }: GameVoteServerProps) => {
	const session = await auth()

	let _votesAmt = 0
	let _currentVote: VoteType | null | undefined = undefined

	if (getData) {
		const post = await getData()
		if (!post) return notFound()

		_votesAmt = post.votes.reduce((acc, vote) => {
			if (vote.type === 'UP') return acc + 1
			if (vote.type === 'DOWN') return acc - 1
			return acc
		}, 0)

		_currentVote = post.votes.find((vote) => vote.userId === session?.user?.id)?.type as VoteType
	} else {
		_votesAmt = initialVotesAmt ?? 0
		_currentVote = initialVote
	}

	return <GameVoteClient gameId={gameId} initialVotesAmt={_votesAmt} initialVote={_currentVote} />
}

export default GameVoteServer
