import { z } from 'zod'

export const GameVoteValidator = z.object({
	gameId: z.string(),
	voteType: z.enum(['UP', 'DOWN']),
})

export type GameVoteRequest = z.infer<typeof GameVoteValidator>

export const CommentVoteValidator = z.object({
	commentId: z.string(),
	voteType: z.enum(['UP', 'DOWN']),
})

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>
