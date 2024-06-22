'use client'

import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { formatTimeToNow } from '@/lib/utils'
import type { CommentRequest } from '@/lib/validators/comment'
import type { Comment, CommentVote, User } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { MessageSquare } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type FC, useRef, useState } from 'react'
import CommentVotes from '../CommentVotes'
import { UserAvatar } from '../UserAvatar'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { toast } from '../ui/use-toast'

type ExtendedComment = Comment & {
	votes: CommentVote[]
	author: User
}

interface GameCommentProps {
	comment: ExtendedComment
	votesAmt: number
	currentVote: CommentVote | undefined
	gameId: string
}

const GameComment: FC<GameCommentProps> = ({ comment, votesAmt, currentVote, gameId }) => {
	const { data: session } = useSession()
	const [isReplying, setIsReplying] = useState<boolean>(false)
	const commentRef = useRef<HTMLDivElement>(null)
	const [input, setInput] = useState<string>(`@${comment.author.username} `)
	const router = useRouter()
	useOnClickOutside(commentRef, () => {
		setIsReplying(false)
	})

	const { mutate: postComment, isPending: isLoading } = useMutation({
		mutationFn: async ({ gameId, text, replyToId }: CommentRequest) => {
			const payload: CommentRequest = { gameId, text, replyToId }

			const { data } = await axios.patch('/api/comment', payload)
			return data
		},

		onError: () => {
			return toast({
				title: 'Something went wrong.',
				description: "Comment wasn't created successfully. Please try again.",
				variant: 'destructive',
			})
		},
		onSuccess: () => {
			router.refresh()
			setIsReplying(false)
		},
	})

	return (
		<div ref={commentRef} className='flex flex-col'>
			<div className='flex items-center'>
				<UserAvatar
					user={{
						name: comment.author.name || null,
						image: comment.author.image || null,
					}}
					className='h-6 w-6'
				/>
				<div className='ml-2 flex items-center gap-x-2'>
					<p className='text-sm font-medium'>{comment.author.username}</p>

					<p className='max-h-40 truncate text-xs text-zinc-400'>{formatTimeToNow(new Date(comment.createdAt))}</p>
				</div>
			</div>

			<p className='mb-2 mt-3 break-words px-2 text-sm'>{comment.text}</p>

			<div className='flex items-center gap-2'>
				<CommentVotes commentId={comment.id} votesAmt={votesAmt} currentVote={currentVote} />

				<Button
					onClick={() => {
						if (!session) return router.push('/sign-in')
						setIsReplying(true)
					}}
					variant='ghost'
					size='sm'
				>
					<MessageSquare className='mr-1.5 h-4 w-4' />
					Reply
				</Button>
			</div>

			{isReplying ? (
				<div className='grid w-full gap-1.5'>
					<Label htmlFor='comment'>Your comment</Label>
					<div className='mt-2'>
						<Textarea
							onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
							autoFocus
							id='comment'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							rows={1}
							placeholder='What are your thoughts?'
						/>

						<div className='mt-2 flex justify-end gap-2'>
							<Button tabIndex={-1} variant='ghost' onClick={() => setIsReplying(false)}>
								Cancel
							</Button>
							<Button
								isLoading={isLoading}
								onClick={() => {
									if (!input) return
									postComment({
										gameId,
										text: input,
										replyToId: comment.replyToId ?? comment.id, // default to top-level comment
									})
								}}
							>
								Post
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	)
}

export default GameComment
