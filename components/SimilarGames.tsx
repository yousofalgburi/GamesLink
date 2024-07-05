'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ExtendedGame } from '@/types/db'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { BadgeInfo, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import { toast } from './ui/use-toast'
import HiddenAuth from './HiddenAuth'
import { VoteType } from '@/constants/enums'

export default function SimilarGames({ gameId }: { gameId: string }) {
	const [fetchOnce, setFetchOnce] = useState(false)
	const { data: session } = useSession()
	const router = useRouter()

	const {
		data: games,
		mutate: fetchSimilarGames,
		isPending: isLoading,
	} = useMutation({
		mutationFn: async () => {
			const payload = { gameId }

			const { data } = await axios.post('/api/games/similar', payload)
			return data.similarGames as ExtendedGame[]
		},
		onError: (err) => {
			if (err instanceof AxiosError) {
				if (err.response?.status === 401) {
					return toast({
						title: 'Authentication required.',
						description: 'Please sign in to see similar games.',
						variant: 'destructive',
					})
				}
			}

			return toast({
				title: 'Something went wrong.',
				description: 'Similar games not loaded successfully. Please try again.',
				variant: 'destructive',
			})
		},
		onSuccess: () => {
			router.refresh()
		},
	})

	useEffect(() => {
		if (!fetchOnce && gameId) {
			fetchSimilarGames()
			setFetchOnce(true)
		}
	}, [fetchSimilarGames, fetchOnce, gameId])

	return (
		<>
			<div className='flex items-center justify-between pb-4'>
				<div className='flex items-center gap-3'>
					<h1 className='text-3xl font-bold'>Similar Games</h1>

					{session?.user && (
						<Dialog>
							<DialogTrigger asChild>
								<BadgeInfo className='cursor-pointer' />
							</DialogTrigger>
							<DialogContent className='sm:max-w-[425px]'>
								<DialogHeader>
									<DialogTitle>Similar Games</DialogTitle>
								</DialogHeader>

								<p>
									These games are recommended based on their similarity to the selected game. The similarity is calculated based on
									genres and categories.
								</p>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>

			{session?.user ? (
				<Carousel
					opts={{
						align: 'start',
					}}
					className='w-full'
				>
					<CarouselContent className={`${isLoading ? 'flex items-center justify-center' : ''}`}>
						{isLoading && <Loader2 className='animate-spin' />}

						{games?.map((game) => {
							const votesAmt = game.votes.reduce((acc, vote) => {
								if (vote.type === VoteType.UP) return acc + 1
								if (vote.type === VoteType.DOWN) return acc - 1
								return acc
							}, 0)

							const currentVote = game.votes.find((vote) => vote.userId === session?.user.id)

							return (
								<CarouselItem key={game.id} className='md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5'>
									<GameCard
										className='h-[40rem]'
										key={game.id}
										votesAmt={votesAmt}
										currentVote={currentVote?.type as VoteType}
										game={game}
									/>
								</CarouselItem>
							)
						})}
					</CarouselContent>
					<CarouselPrevious className={`${isLoading ? 'hidden' : ''}`} />
					<CarouselNext className={`${isLoading ? 'hidden' : ''}`} />
				</Carousel>
			) : (
				<HiddenAuth message='to see similar games.' />
			)}
		</>
	)
}
