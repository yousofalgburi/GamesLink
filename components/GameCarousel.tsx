import type { ExtendedGame } from '@/types/db'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import GameCard from './GameCard'

export default function GameCarousel({ games }: { games: ExtendedGame[] }) {
	return (
		<Carousel
			opts={{
				align: 'start',
			}}
			className='w-full'
		>
			<CarouselContent>
				{games?.map((game) => {
					return (
						<CarouselItem key={game.id} className='md:basis-1/2 lg:basis-1/3'>
							<GameCard key={game.id} votesAmt={game.voteCount} currentVote={game.voteType} game={game} />
						</CarouselItem>
					)
				})}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	)
}
