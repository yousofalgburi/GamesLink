'use client'

import { useCustomToasts } from '@frontend/hooks/use-custom-toasts'
import type { GameVoteRequest } from '@frontend/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@frontend/types/db'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Button } from '@frontend/components/ui/button'
import { cn } from '@frontend/lib/utils'
import { toast } from '@frontend/components/ui/use-toast'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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
				if (type === 'UP') setVotesAmt((prev) => prev - 1)
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
			if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
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
				if (type === 'UP') setVotesAmt((prev) => prev - 1)
				else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
			} else {
				setCurrentVote(type)
				if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
				else if (type === 'DOWN') setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
			}

			router.refresh()
		},
	})

	return (
		<div className='flex items-center gap-4'>
			<Button onClick={() => !isLoading && vote('UP')} variant='ghost' aria-label='upvote'>
				<ThumbsUp
					className={cn('h-5 w-5 text-zinc-700', {
						'fill-emerald-500 text-emerald-500': currentVote === 'UP',
					})}
				/>
			</Button>

			<label className='text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>{votesAmt}</label>

			<Button
				onClick={() => !isLoading && vote('DOWN')}
				className={cn({
					'text-emerald-500': currentVote === 'DOWN',
				})}
				variant='ghost'
				aria-label='downvote'
			>
				<ThumbsDown
					className={cn('h-5 w-5 text-zinc-700', {
						'fill-red-500 text-red-500': currentVote === 'DOWN',
					})}
				/>
			</Button>
		</div>
	)
}

export default GameVoteClient
