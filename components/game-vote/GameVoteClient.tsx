'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import type { GameVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { toast } from '../ui/use-toast'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { VoteType } from '@/constants/enums'

interface GameVoteClientProps {
	gameId: string
	initialVotesAmt: number
	initialVote?: VoteType | null
}

const GameVoteClient = ({ gameId, initialVotesAmt, initialVote }: GameVoteClientProps) => {
	const { data: session } = useSession()
	const router = useRouter()
	const { loginToast } = useCustomToasts()
	const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
	const [currentVote, setCurrentVote] = useState(initialVote)
	const prevVote = usePrevious(currentVote)

	useEffect(() => {
		setCurrentVote(initialVote)
	}, [initialVote])

	const { mutate: vote, isPending: isLoading } = useMutation({
		mutationFn: async (type: VoteType) => {
			if (!session?.user) {
				if (type === VoteType.UP) setVotesAmt((prev) => prev - 1)
				else setVotesAmt((prev) => prev + 1)
				setCurrentVote(prevVote)
				return loginToast()
			}

			const payload: GameVoteRequest = {
				voteType: type,
				gameId: gameId,
			}

			await axios.patch('/api/games/vote', payload)
		},
		onError: (err, voteType) => {
			if (voteType === VoteType.UP) setVotesAmt((prev) => prev - 1)
			else setVotesAmt((prev) => prev + 1)

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
			if (currentVote === type) {
				setCurrentVote(undefined)
				if (type === VoteType.UP) setVotesAmt((prev) => prev - 1)
				else if (type === VoteType.DOWN) setVotesAmt((prev) => prev + 1)
			} else {
				setCurrentVote(type)
				if (type === VoteType.UP) setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
				else if (type === VoteType.DOWN) setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
			}

			router.refresh()
		},
	})

	return (
		<div className='flex items-center gap-4'>
			<Button onClick={() => !isLoading && vote(VoteType.UP)} variant='ghost' aria-label='upvote'>
				<ThumbsUp
					className={cn('h-5 w-5 text-zinc-700', {
						'fill-emerald-500 text-emerald-500': currentVote === VoteType.UP,
					})}
				/>
			</Button>

			<label className='text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>{votesAmt}</label>

			<Button
				onClick={() => !isLoading && vote(VoteType.DOWN)}
				className={cn({
					'text-emerald-500': currentVote === VoteType.DOWN,
				})}
				variant='ghost'
				aria-label='downvote'
			>
				<ThumbsDown
					className={cn('h-5 w-5 text-zinc-700', {
						'fill-red-500 text-red-500': currentVote === VoteType.DOWN,
					})}
				/>
			</Button>
		</div>
	)
}

export default GameVoteClient
