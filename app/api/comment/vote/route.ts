import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommentVoteValidator } from '@/lib/validators/vote'
import { z } from 'zod'

export async function PATCH(req: Request) {
	// check server side vote count
	const updatVoteCount = async (commentId: string) => {
		const updatedComment = await db.comment.findUnique({
			where: { id: commentId },
			include: { votes: true },
		})

		if (!updatedComment) {
			return new Response('Post not found', { status: 404 })
		}

		const votesAmt = updatedComment.votes.reduce((acc, vote) => {
			if (vote.type === 'UP') return acc + 1
			if (vote.type === 'DOWN') return acc - 1
			return acc
		}, 0)

		await db.comment.update({
			where: { id: commentId },
			data: { voteCount: votesAmt },
		})
	}

	try {
		const body = await req.json()

		const { commentId, voteType } = CommentVoteValidator.parse(body)

		const session = await getAuthSession()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		// check if user has already voted on this post
		const existingVote = await db.commentVote.findFirst({
			where: {
				userId: session.user.id,
				commentId,
			},
		})

		if (existingVote) {
			// if vote type is the same as existing vote, delete the vote
			if (existingVote.type === voteType) {
				await db.commentVote.delete({
					where: {
						userId_commentId: {
							commentId,
							userId: session.user.id,
						},
					},
				})

				await updatVoteCount(commentId)

				return new Response('OK')
			} else {
				// if vote type is different, update the vote
				await db.commentVote.update({
					where: {
						userId_commentId: {
							commentId,
							userId: session.user.id,
						},
					},
					data: {
						type: voteType,
					},
				})

				await updatVoteCount(commentId)

				return new Response('OK')
			}
		}

		// if no existing vote, create a new vote
		await db.commentVote.create({
			data: {
				type: voteType,
				userId: session.user.id,
				commentId,
			},
		})

		await updatVoteCount(commentId)

		return new Response('OK')
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not vote on comment at this time. Please try later', { status: 500 })
	}
}
