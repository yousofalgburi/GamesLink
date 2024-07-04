import { VoteType } from '@/constants/enums'
import { z } from 'zod'

export const GameVoteValidator = z.object({
	gameId: z.string(),
	voteType: z.enum([VoteType.UP, VoteType.DOWN]),
})

export type GameVoteRequest = z.infer<typeof GameVoteValidator>

export const CommentVoteValidator = z.object({
	commentId: z.string(),
	voteType: z.enum([VoteType.UP, VoteType.DOWN]),
})

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>
