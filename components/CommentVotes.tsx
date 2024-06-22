'use client'

import { Button } from '@/components/ui/button'
import { toast } from './ui/use-toast'
import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { cn } from '@/lib/utils'
import type { CommentVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import type { CommentVote, VoteType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { type FC, useState } from 'react'
import { useSession } from 'next-auth/react'

interface CommentVotesProps {
	commentId: string
	votesAmt: number
	currentVote?: PartialVote
}

type PartialVote = Pick<CommentVote, 'type'>

const CommentVotes: FC<CommentVotesProps> = ({ commentId, votesAmt: _votesAmt, currentVote: _currentVote }) => {
	const { data: session } = useSession()

	const { loginToast } = useCustomToasts()
	const [votesAmt, setVotesAmt] = useState<number>(_votesAmt)
	const [currentVote, setCurrentVote] = useState<PartialVote | undefined>(_currentVote)
	const prevVote = usePrevious(currentVote)

	const { mutate: vote, isPending: isLoading } = useMutation({
		mutationFn: async (type: VoteType) => {
			if (!session?.user) {
				if (type === 'UP') setVotesAmt((prev) => prev - 1)
				else setVotesAmt((prev) => prev + 1)
				setCurrentVote(prevVote)
				return loginToast()
			}

			const payload: CommentVoteRequest = {
				voteType: type,
				commentId,
			}

			await axios.patch('/api/comment/vote', payload)
		},
		onError: (err, voteType) => {
			if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
			else setVotesAmt((prev) => prev + 1)

			// reset current vote
			setCurrentVote(prevVote)

			if (err instanceof AxiosError) {
				if (err.response?.status === 401) {
					return loginToast()
				}
			}

			return toast({
				title: 'Something went wrong.',
				description: 'Your vote was not registered. Please try again.',
				variant: 'destructive',
			})
		},
		onMutate: (type: VoteType) => {
			if (currentVote?.type === type) {
				// User is voting the same way again, so remove their vote
				setCurrentVote(undefined)
				if (type === 'UP') setVotesAmt((prev) => prev - 1)
				else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
			} else {
				// User is voting in the opposite direction, so subtract 2
				setCurrentVote({ type })
				if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
				else if (type === 'DOWN') setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
			}
		},
	})

	return (
		<div className='flex gap-1'>
			{/* upvote */}
			<Button onClick={() => vote('UP')} size='sm' variant='ghost' aria-label='upvote'>
				<ThumbsUp
					className={cn('h-5 w-5', {
						'fill-emerald-500 text-emerald-500': currentVote?.type === 'UP',
					})}
				/>
			</Button>

			{/* score */}
			<p className='px-1 py-2 text-center text-xs font-medium'>{votesAmt}</p>

			{/* downvote */}
			<Button
				onClick={() => vote('DOWN')}
				size='sm'
				className={cn({
					'text-emerald-500': currentVote?.type === 'DOWN',
				})}
				variant='ghost'
				aria-label='downvote'
			>
				<ThumbsDown
					className={cn('h-5 w-5', {
						'fill-red-500 text-red-500': currentVote?.type === 'DOWN',
					})}
				/>
			</Button>
		</div>
	)
}

export default CommentVotes
