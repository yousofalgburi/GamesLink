'use client'

import { FriendsContext } from '@/lib/context/FriendsContext'
import { ExtendedGame } from '@/types/db'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useContext, useEffect } from 'react'
import GameCard from './GameCard'
import { UserAvatar } from './UserAvatar'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import { useToast } from './ui/use-toast'

export default function LinkRoom() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const { friends } = useContext(FriendsContext)

    const { data: hostGames, isLoading } = useQuery({
        queryKey: ['host-games'],
        queryFn: async () => {
            const { data } = await axios.get('/api/linkroom/host-games')
            return data as { games: ExtendedGame[] }
        },
    })

    useEffect(() => {
        const roomID = window.location.pathname.split('/').pop()
        const ws = new WebSocket(`ws://localhost:8000`)

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'join', roomID }))
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === 'userJoined') {
                console.log('A new user has joined the room')
            }
        }

        return () => {
            ws.close()
        }
    }, [])

    return (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex items-center gap-2">
                            <UserAvatar
                                user={{ name: session?.user.name || null, image: session?.user.image || null }}
                            />
                            {session?.user.name}
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {session?.user.username} ({session?.user.credits} Credits)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="pb-2 text-2xl font-medium">Games ({hostGames?.games.length}):</p>

                    <Carousel>
                        <CarouselContent className={`${isLoading ? 'flex items-center justify-center' : ''}`}>
                            {isLoading && <Loader2 className="animate-spin" />}

                            {hostGames?.games &&
                                hostGames.games.map((game, index) => {
                                    const votesAmt = game.votes.reduce((acc, vote) => {
                                        if (vote.type === 'UP') return acc + 1
                                        if (vote.type === 'DOWN') return acc - 1
                                        return acc
                                    }, 0)

                                    const currentVote = game.votes.find((vote) => vote.userId === session?.user.id)

                                    return (
                                        <CarouselItem key={index} className="flex basis-full gap-2 lg:basis-1/2">
                                            <GameCard
                                                className="h-[28rem]"
                                                nowidth={true}
                                                key={index}
                                                votesAmt={votesAmt}
                                                currentVote={currentVote}
                                                game={game}
                                            />
                                        </CarouselItem>
                                    )
                                })}
                        </CarouselContent>

                        <CarouselPrevious className={`${isLoading ? 'hidden' : ''}`} />
                        <CarouselNext className={`${isLoading ? 'hidden' : ''}`} />
                    </Carousel>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex h-full w-full items-center justify-center p-4">
                    <Button
                        onClick={() => {
                            toast({
                                title: 'Copied',
                                description: 'The invite link has been copied to your clipboard',
                            })
                            navigator.clipboard.writeText(window.location.href)
                        }}
                    >
                        Copy Invite Link
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
