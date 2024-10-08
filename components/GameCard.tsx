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
				<Card className={cn('w-full', className, 'flex flex-col')} key={game.id} ref={ref}>
					<div className='flex flex-col'>
						<div className='relative w-full h-[140px] overflow-hidden'>
							<Image
								alt={game.name}
								className='rounded-t-lg object-cover'
								fill
								sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
								src={`${game.headerImage}`}
							/>
						</div>
						<div className='p-3 flex flex-col'>
							<CardTitle className='text-base mb-1 line-clamp-1'>{game.name}</CardTitle>
							<CardDescription className='text-xs line-clamp-2 mb-2' title={game.shortDescription}>
								{game.shortDescription}
							</CardDescription>
							<div className='flex flex-wrap items-center gap-1 mt-auto'>
								{game.genres.slice(0, 2).map((genre, index) => (
									<Badge key={`g-${index}-${genre}`} variant='secondary' className='text-[10px] px-1 py-0'>
										{genre}
									</Badge>
								))}
							</div>
						</div>
					</div>
					<CardFooter className='justify-between items-center px-3 py-2 text-[10px]'>
						<div className='flex gap-2'>
							<div className='flex items-center gap-1'>
								<DollarSign className='w-3 h-3' />
								<div className='text-muted-foreground'>{game.isFree ? 'Free to Play' : 'Paid'}</div>
							</div>
							<div className='flex items-center gap-1'>
								<Calendar className='w-3 h-3' />
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
