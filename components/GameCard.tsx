import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SteamGame, Vote } from '@prisma/client'
import Link from 'next/link'
import { type Ref, forwardRef } from 'react'
import GamePostVoteClient from './game-vote/GameVoteClient'
import { Badge } from './ui/badge'
import Image from 'next/image'

type PartialVote = Pick<Vote, 'type'>

interface GameCardProps {
	game: SteamGame
	ref?: Ref<HTMLDivElement>
	votesAmt: number
	currentVote?: PartialVote
	className?: string
	nowidth?: boolean
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(({ game, votesAmt: _votesAmt, currentVote: _currentVote, className, nowidth }, ref) => {
	return (
		<Card className={cn(`${nowidth ? '' : 'min-w-64'}`, className, 'max-h-[35rem] overflow-auto')} key={game.id} ref={ref}>
			<Link href={`/game/${game.id}`}>
				<CardHeader className='m-0 p-0'>
					<Image
						alt={game.name}
						className='w-full rounded-t-lg bg-cover object-cover'
						height='800'
						width='400'
						src={`${game.headerImage}`}
					/>
				</CardHeader>

				<CardContent className={`px-3 py-4 ${nowidth ? 'max-h-60 overflow-y-scroll' : ''}`}>
					<CardTitle>{game.name}</CardTitle>
					<CardDescription className='pt-1'>{game.shortDescription}</CardDescription>

					{game.genres.length && (
						<div className='flex flex-wrap items-center gap-1 pt-3'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Genres:
							</label>
							{game.genres.map((genre) => (
								<Badge key={genre}>{genre}</Badge>
							))}
						</div>
					)}

					{game.categories.length && (
						<div className='flex max-h-24 flex-wrap items-center gap-1 overflow-y-auto pt-3'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Categories:
							</label>
							{game.categories.map((category) => (
								<Badge key={category}>{category}</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Link>

			<CardFooter className='justify-end'>
				<GamePostVoteClient gameId={game.id.toString()} initialVotesAmt={_votesAmt} initialVote={_currentVote?.type} />
			</CardFooter>
		</Card>
	)
})

GameCard.displayName = 'GameCard'

export default GameCard
