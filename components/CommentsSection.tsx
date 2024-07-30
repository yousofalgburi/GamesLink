import { auth } from '@/auth'
import { db } from '@/prisma/db'
import type { Comment, CommentVote, User } from '@prisma/client'
import CreateComment from './CreateComment'
import GameComment from './comments/GameComment'
import { VoteType } from '@/constants/enums'

type ExtendedComment = Comment & {
	votes: CommentVote[]
	author: User
	replies: ReplyComment[]
}

type ReplyComment = Comment & {
	votes: CommentVote[]
	author: User
}

interface CommentsSectionProps {
	gameId: string
	orderBy: string
	comments: ExtendedComment[]
}

const CommentsSection = async ({ gameId, orderBy }: CommentsSectionProps) => {
	const session = await auth()
	const order = {
		[orderBy]: 'desc',
	}

	const comments = await db.comment.findMany({
		where: {
			gameId: Number(gameId),
			replyToId: null, // only fetch top-level comments
		},
		include: {
			author: true,
			votes: true,
			replies: {
				// first level replies
				include: {
					author: true,
					votes: true,
				},
			},
		},
		orderBy: order,
	})

	return (
		<div className='mt-4 flex flex-col gap-y-4'>
			<CreateComment gameId={gameId} />

			<div className='mt-4 flex max-h-[45rem] flex-col gap-y-6 overflow-y-scroll'>
				{comments
					.filter((comment) => !comment.replyToId)
					.map((topLevelComment) => {
						const topLevelCommentVotesAmt = topLevelComment.votes.reduce((acc, vote) => {
							if (vote.type === VoteType.UP) return acc + 1
							if (vote.type === VoteType.DOWN) return acc - 1
							return acc
						}, 0)

						const topLevelCommentVote = topLevelComment.votes.find((vote) => vote.userId === session?.user.id)

						return (
							<div key={topLevelComment.id} className='flex flex-col'>
								<div className='mb-2'>
									<GameComment
										comment={topLevelComment}
										currentVote={topLevelCommentVote}
										votesAmt={topLevelCommentVotesAmt}
										gameId={gameId}
									/>
								</div>

								{/* Render replies */}
								{topLevelComment.replies
									.sort((a, b) => b.votes.length - a.votes.length) // Sort replies by most liked
									.map((reply) => {
										const replyVotesAmt = reply.votes.reduce((acc, vote) => {
											if (vote.type === VoteType.UP) return acc + 1
											if (vote.type === VoteType.DOWN) return acc - 1
											return acc
										}, 0)

										const replyVote = reply.votes.find((vote) => vote.userId === session?.user.id)

										return (
											<div key={reply.id} className='ml-2 border-l-2 border-zinc-200 py-2 pl-4'>
												<GameComment comment={reply} currentVote={replyVote} votesAmt={replyVotesAmt} gameId={gameId} />
											</div>
										)
									})}
							</div>
						)
					})}
			</div>
		</div>
	)
}

export default CommentsSection
