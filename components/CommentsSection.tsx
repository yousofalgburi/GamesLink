import { auth } from '@/auth'
import CreateComment from './CreateComment'
import GameComment from './comments/GameComment'
import type { VoteType } from '@/constants/enums'
import { comments as commentsTable, commentVotes, users } from '@/db/schema'
import { db } from '@/db'
import { desc, eq, and, type InferSelectModel, ConsoleLogWriter } from 'drizzle-orm'

export type ExtendedComment = Omit<InferSelectModel<typeof commentsTable>, 'author'> & {
	author: {
		id: string
		name: string
		username: string
		email: string
		image: string
	}
	voteType: VoteType | null
	replies: ExtendedComment[]
}

interface CommentsSectionProps {
	gameId: string
	orderBy?: 'votes' | 'date'
}

const CommentsSection = async ({ gameId, orderBy = 'votes' }: CommentsSectionProps) => {
	const session = await auth()

	const commentsWithReplies = await db
		.select({
			id: commentsTable.id,
			text: commentsTable.text,
			createdAt: commentsTable.createdAt,
			authorId: commentsTable.authorId,
			gameId: commentsTable.gameId,
			replyToId: commentsTable.replyToId,
			voteCount: commentsTable.voteCount,
			author: {
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				image: users.image,
			},
			voteType: commentVotes.type,
		})
		.from(commentsTable)
		.innerJoin(users, eq(commentsTable.authorId, users.id))
		.leftJoin(
			commentVotes,
			and(eq(commentsTable.id, commentVotes.commentId), session?.user?.id ? eq(commentVotes.userId, session.user.id) : undefined),
		)
		.where(eq(commentsTable.gameId, Number(gameId)))
		.orderBy(orderBy === 'votes' ? desc(commentsTable.voteCount) : desc(commentsTable.createdAt))

	const topLevelComments: ExtendedComment[] = []
	const commentMap = new Map<string, ExtendedComment>()

	for (const comment of commentsWithReplies) {
		const processedComment: ExtendedComment = {
			...comment,
			voteType: comment.voteType as VoteType | null,
			author: {
				id: comment.author.id,
				name: comment.author.name ?? '',
				username: comment.author.username ?? '',
				email: comment.author.email ?? '',
				image: comment.author.image ?? '',
			},
			replies: [],
		}

		commentMap.set(comment.id, processedComment)

		if (comment.replyToId === null) {
			topLevelComments.push(processedComment)
		}
	}

	for (const comment of commentsWithReplies) {
		if (comment.replyToId !== null) {
			const parentComment = commentMap.get(comment.replyToId)
			if (parentComment) {
				const replyComment = commentMap.get(comment.id)
				if (replyComment) {
					parentComment.replies.push(replyComment)
				}
			}
		}
	}

	return (
		<div className='mt-4 flex flex-col gap-y-4'>
			<CreateComment gameId={gameId} />
			<div className='mt-4 flex max-h-[45rem] flex-col gap-y-6 overflow-y-scroll'>
				{topLevelComments.map((topLevelComment) => (
					<div key={topLevelComment.id} className='flex flex-col'>
						<div className='mb-2'>
							<GameComment
								comment={topLevelComment}
								currentVote={topLevelComment.voteType}
								votesAmt={topLevelComment.voteCount}
								gameId={gameId}
							/>
						</div>

						{/* Render replies */}
						{topLevelComment.replies
							.sort((a, b) => (orderBy === 'votes' ? b.voteCount - a.voteCount : b.createdAt.getTime() - a.createdAt.getTime()))
							.map((reply) => (
								<div key={reply.id} className='ml-2 border-l-2 border-zinc-200 py-2 pl-4'>
									<GameComment comment={reply} currentVote={reply.voteType} votesAmt={reply.voteCount} gameId={gameId} />
								</div>
							))}
					</div>
				))}
			</div>
		</div>
	)
}

export default CommentsSection
