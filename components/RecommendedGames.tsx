import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ExtendedGame } from '@/types/db'
import { BadgeInfo } from 'lucide-react'
import { auth } from '@/auth'
import GameCard from './GameCard'
import HiddenAuth from './HiddenAuth'
import { getRecommendedGames } from '@/db/queries/getRecommendedGames'

export default async function RecommendedGames() {
	const session = await auth()
	let games: ExtendedGame[] = []
	if (session?.user) {
		games = await getRecommendedGames(session.user.id)
	}

	return (
		<>
			<div className='flex items-center justify-between pb-4'>
				<div className='flex items-center gap-3'>
					<h1 className='text-3xl font-bold'>Recommended Games</h1>

					{session?.user && (
						<Dialog>
							<DialogTrigger asChild>
								<BadgeInfo className='cursor-pointer' />
							</DialogTrigger>
							<DialogContent className='sm:max-w-[425px]'>
								<DialogHeader>
									<DialogTitle>Recommended Games</DialogTitle>
								</DialogHeader>

								<p>
									The recommendations are based on games you have liked/disliked. It is strongly recommended to like/dislike as many
									games as possible to improve recommendations. These recommendations do not take into account your friends'
									likes/dislikes.
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
					<CarouselContent>
						{games.map((game) => (
							<CarouselItem key={game.id} className='md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5'>
								<GameCard className='h-[40rem]' votesAmt={game.voteCount} currentVote={game.voteType} game={game} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			) : (
				<HiddenAuth message='to see games you have interacted with and get recommendations.' />
			)}
		</>
	)
}
