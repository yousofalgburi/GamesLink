import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { cn } from '@frontend/lib/utils'
import type { SteamGame, Vote } from '@frontend/types/db'
import Link from 'next/link'
import { type Ref, forwardRef } from 'react'

type PartialVote = Pick<Vote, 'type'>

interface GameCardProps {
	game: SteamGame
	ref?: Ref<HTMLDivElement>
	votesAmt: number
	currentVote?: string
	className?: string
	nowidth?: boolean
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(({ game, votesAmt: _votesAmt, currentVote: _currentVote, className, nowidth }, ref) => {
	return (
		<Card className={cn(`${nowidth ? '' : 'min-w-64'}`, className, 'max-h-[35rem] overflow-auto')} key={game.id} ref={ref}>
			<Link href={`/game/${game.id}`}>
				<CardHeader className='m-0 p-0'>
					<img
						alt={game.name || ''}
						className='w-full rounded-t-lg bg-cover object-cover'
						height='400'
						width='200'
						src={`${game.headerImage}`}
					/>
				</CardHeader>

				<CardContent className={`px-3 py-4 ${nowidth ? 'max-h-60 overflow-y-scroll' : ''}`}>
					<CardTitle>{game.name}</CardTitle>
					<CardDescription className='pt-1'>{game.shortDescription}</CardDescription>

					{/* {game.genres?.length && (
						<div className='flex flex-wrap items-center gap-1 pt-3'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Genres:
							</label>
							{game.genres.map((genre, index) => (
								<Badge key={index}>{genre}</Badge>
							))}
						</div>
					)}

					{game.categories.length && (
						<div className='flex max-h-24 flex-wrap items-center gap-1 overflow-y-auto pt-3'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Categories:
							</label>
							{game.categories.map((category, index) => (
								<Badge key={index}>{category}</Badge>
							))}
						</div>
					)} */}
				</CardContent>
			</Link>
		</Card>
	)
})

GameCard.displayName = 'GameCard'

export default GameCard
