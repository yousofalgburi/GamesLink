import { VoteType } from '@/constants/enums'
import { auth } from '@/auth'
import { db } from '@/db'
import { CommentVoteValidator } from '@/lib/validators/vote'
import { z } from 'zod'
import { comments, commentVotes } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'

export async function PATCH(req: Request) {
	const updateVoteCount = async (commentId: string) => {
		const [updatedComment] = await db.select().from(comments).where(eq(comments.id, commentId))

		if (!updatedComment) {
			return 0
		}

		const totalVotes = await db.select().from(commentVotes).where(eq(commentVotes.commentId, commentId))

		const votesAmt = totalVotes.reduce((acc, vote) => {
			if (vote.type === VoteType.UP) return acc + 1
			if (vote.type === VoteType.DOWN) return acc - 1
			return acc
		}, 0)

		await db
			.update(comments)
			.set({
				voteCount: votesAmt,
			})
			.where(eq(comments.id, commentId))

		return votesAmt
	}

	try {
		const body = await req.json()

		const { commentId, voteType } = CommentVoteValidator.parse(body)

		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const [existingVote] = await db
			.select()
			.from(commentVotes)
			.where(and(eq(commentVotes.userId, session.user.id), eq(commentVotes.commentId, commentId)))

		if (existingVote) {
			if (existingVote.type === voteType) {
				await db.delete(commentVotes).where(and(eq(commentVotes.userId, session.user.id), eq(commentVotes.commentId, commentId)))
			} else {
				await db
					.update(commentVotes)
					.set({
						type: voteType,
					})
					.where(and(eq(commentVotes.userId, session.user.id), eq(commentVotes.commentId, commentId)))
			}
		} else {
			await db.insert(commentVotes).values({
				type: voteType,
				userId: session.user.id,
				commentId: commentId,
			})
		}

		await updateVoteCount(commentId)

		return new Response('OK')
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		console.error(error)
		return new Response('Could not vote on comment at this time. Please try later', { status: 500 })
	}
}
