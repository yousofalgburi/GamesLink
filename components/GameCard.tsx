import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { type Ref, forwardRef } from 'react'
import GamePostVoteClient from './game-vote/GameVoteClient'
import { Badge } from './ui/badge'
import Image from 'next/image'
import type { GameView } from '@/types/db'
import type { VoteType } from '@/constants/enums'

interface GameCardProps {
	game: GameView
	ref?: Ref<HTMLDivElement>
	votesAmt: number
	currentVote?: VoteType
	className?: string
	nowidth?: boolean
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(({ game, votesAmt: _votesAmt, currentVote: _currentVote, className, nowidth }, ref) => {
	return (
		<Card className={cn(`${nowidth ? '' : 'min-w-64'}`, className, 'max-h-[35rem] overflow-auto')} key={game.id} ref={ref}>
			<Link href={`/game/${game.steamAppid}`}>
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
							{game.genres.map((genre) => (
								<Badge key={`g-${genre}`}>{genre}</Badge>
							))}

							{game.categories.map((category) => (
								<Badge key={'${category}'}>{category}</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Link>

			<CardFooter className='justify-end'>
				<GamePostVoteClient gameId={game?.steamAppid?.toString() ?? ''} initialVotesAmt={_votesAmt} initialVote={_currentVote} />
			</CardFooter>
		</Card>
	)
})

GameCard.displayName = 'GameCard'

export default GameCard
