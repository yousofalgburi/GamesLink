import { auth } from '@/auth'
import GameVoteClient from './GameVoteClient'
import type { VoteType } from '@/constants/enums'
import type { ExtendedGame } from '@/types/db'
import { db } from '@/db'
import { gameVotes, processedGames } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

interface GameVoteServerProps {
	gameId: string
	initialVotesAmt?: number
	initialVote?: VoteType | null
	getData?: () => Promise<ExtendedGame | null>
}

const GameVoteServer = async ({ gameId }: GameVoteServerProps) => {
	const session = await auth()

	const [game] = (await db
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
		.leftJoin(gameVotes, and(eq(gameVotes.gameId, processedGames.id), eq(gameVotes.userId, session?.user?.id ?? '')))
		.where(and(eq(processedGames.steamAppid, Number(gameId))))) as ExtendedGame[]

	const _votesAmt = game.voteCount
	const _currentVote = game.voteType

	return <GameVoteClient gameId={gameId} initialVotesAmt={_votesAmt} initialVote={_currentVote} />
}

export default GameVoteServer
