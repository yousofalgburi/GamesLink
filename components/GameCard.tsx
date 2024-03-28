/* eslint-disable @next/next/no-img-element */
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SteamGame, Vote } from '@prisma/client'
import Link from 'next/link'
import { Ref, forwardRef } from 'react'
import PostVoteClient from './post-vote/PostVoteClient'
import { Badge } from './ui/badge'

type PartialVote = Pick<Vote, 'type'>

interface GameCardProps {
    game: SteamGame
    ref?: Ref<HTMLDivElement>
    votesAmt: number
    currentVote?: PartialVote
    className?: string
    nowidth?: boolean
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(
    ({ game, votesAmt: _votesAmt, currentVote: _currentVote, className, nowidth }, ref) => {
        return (
            <Card className={cn(`${nowidth ? '' : 'min-w-64'}`, className)} key={game.id} ref={ref}>
                <Link href={`/game/${game.id}`}>
                    <CardHeader className="m-0 p-0">
                        <img
                            alt={`${game.name} image`}
                            className="w-full rounded-t-lg bg-cover object-cover"
                            height="400"
                            width="200"
                            src={`${game.headerImage}`}
                        />
                    </CardHeader>

                    <CardContent className={`px-3 py-4 ${nowidth ? 'max-h-60 overflow-y-scroll' : ''}`}>
                        <CardTitle>{game.name}</CardTitle>
                        <CardDescription>{game.shortDescription}</CardDescription>

                        {game.genres.length && (
                            <div className="flex flex-wrap gap-1 pt-3">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Genres:
                                </label>
                                {game.genres.map((genre, index) => (
                                    <Badge key={index}>{genre}</Badge>
                                ))}
                            </div>
                        )}

                        {game.categories.length && (
                            <div className="flex flex-wrap gap-1 pt-3">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Categories:
                                </label>
                                {game.categories.map((category, index) => (
                                    <Badge key={index}>{category}</Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Link>

                <CardFooter>
                    <PostVoteClient
                        gameId={game.id.toString()}
                        initialVotesAmt={_votesAmt}
                        initialVote={_currentVote?.type}
                    />
                </CardFooter>
            </Card>
        )
    }
)

GameCard.displayName = 'GameCard'

export default GameCard
