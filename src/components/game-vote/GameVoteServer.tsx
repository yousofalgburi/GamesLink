import { getAuthSession } from '@frontend/lib/auth'
import type { SteamGame, Vote } from '@frontend/types/db'
import { notFound } from 'next/navigation'
import GameVoteClient from './GameVoteClient'

interface GameVoteServerProps {
	gameId: string
	initialVotesAmt?: number
	initialVote?: Vote['type'] | null
	getData?: () => Promise<(SteamGame & { votes: Vote[] }) | null>
}

const GameVoteServer = async ({ gameId, initialVotesAmt, initialVote, getData }: GameVoteServerProps) => {
	const session = await getAuthSession()

	let _votesAmt = 0
	let _currentVote: Vote['type'] | null | undefined = undefined

	if (getData) {
		const post = await getData()
		if (!post) return notFound()

		_votesAmt = post.votes.reduce((acc, vote) => {
			if (vote.type === 'UP') return acc + 1
			if (vote.type === 'DOWN') return acc - 1
			return acc
		}, 0)

		_currentVote = post.votes.find((vote) => vote.userId === session?.user?.id)?.type
	} else {
		_votesAmt = initialVotesAmt!
		_currentVote = initialVote
	}

	return <GameVoteClient gameId={gameId} initialVotesAmt={_votesAmt} initialVote={_currentVote} />
}

export default GameVoteServer
