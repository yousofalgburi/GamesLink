import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { type Ref, forwardRef } from 'react'
import GamePostVoteClient from './game-vote/GameVoteClient'
import { Badge } from './ui/badge'
import Image from 'next/image'
import type { GameView } from '@/types/db'
import type { VoteType } from '@/constants/enums'
import { Calendar, DollarSign } from 'lucide-react'

interface GameCardProps {
	game: GameView
	ref?: Ref<HTMLDivElement>
	votesAmt: number
	currentVote?: VoteType
	className?: string
	nowidth?: boolean
	smallDescription?: boolean
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(
	({ game, votesAmt: _votesAmt, currentVote: _currentVote, className, nowidth, smallDescription = false }, ref) => {
		return (
			<Link href={`/game/${game.steamAppid}`}>
				<Card className={cn(`${nowidth ? 'w-full' : 'min-w-80'}`, className, 'flex flex-col')} key={game.id} ref={ref}>
					<div className='flex h-40'>
						<div className='w-2/4 relative'>
							<Image alt={game.name} className='rounded-l-lg object-cover' fill src={`${game.headerImage}`} />
						</div>
						<div className='w-2/4 p-3 flex flex-col'>
							<CardTitle className='text-lg mb-1 line-clamp-1'>{game.name}</CardTitle>
							<CardDescription className='text-sm line-clamp-3 mb-2' title={game.shortDescription}>
								{smallDescription
									? game.shortDescription.length > 25
										? `${game.shortDescription.slice(0, 25)}...`
										: game.shortDescription
									: game.shortDescription}
							</CardDescription>
							<div className='flex flex-wrap items-center gap-1 mt-auto'>
								{game.genres.slice(0, 2).map((genre, index) => (
									<Badge key={`g-${index}-${genre}`} variant='secondary' className='text-xs'>
										{genre}
									</Badge>
								))}
							</div>
						</div>
					</div>
					<CardFooter className='justify-between items-center px-3 py-2 text-xs'>
						<div className='flex gap-2'>
							<div className='flex items-center gap-1'>
								<DollarSign className='w-4 h-4' />
								<div className='text-muted-foreground'>{game.isFree ? 'Free to Play' : 'Paid'}</div>
							</div>
							<div className='flex items-center gap-1'>
								<Calendar className='w-4 h-4' />
								<div className='text-muted-foreground'>
									{`Released: ${game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'Unknown'}`}
								</div>
							</div>
						</div>
						<GamePostVoteClient gameId={game?.steamAppid?.toString() ?? ''} initialVotesAmt={_votesAmt} initialVote={_currentVote} />
					</CardFooter>
				</Card>
			</Link>
		)
	},
)

GameCard.displayName = 'GameCard'

export default GameCard
