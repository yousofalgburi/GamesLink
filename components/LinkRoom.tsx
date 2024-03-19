'use client'

import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import GameCard from './GameCard'
import { UserAvatar } from './UserAvatar'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import { useToast } from './ui/use-toast'
import { UserInRoom } from '@/types/linkroom'

export default function LinkRoom({ userId, roomUsers }: { userId: string; roomUsers: UserInRoom[] }) {
    const { toast } = useToast()
    const [usersInRoom, setUsersInRoom] = useState<UserInRoom[]>(roomUsers)

    const ws = useMemo(() => {
        return new WebSocket(`ws://localhost:8000`)
    }, [])

    useEffect(() => {
        const roomId = window.location.pathname.split('/').pop()

        ws.onopen = () => {
            if (!usersInRoom.find((user) => user.id === userId)) {
                ws.send(JSON.stringify({ type: 'join', roomId, userId: userId }))
            }
        }

        ws.onmessage = async (event) => {
            const data: { type: string; roomId: string; userId: string } = JSON.parse(event.data)

            if (data.type === 'userJoined' && data.userId !== userId) {
                if (!usersInRoom.find((user) => user.id === data.userId)) {
                    const { data: user } = await axios.get(`/api/linkroom/events/join?userId=${data.userId}`)
                    setUsersInRoom((prevUsers) => [...prevUsers, { ...user.user, games: user.games }])
                }
            } else if (data.type === 'userLeft') {
                setUsersInRoom((prevUsers) => prevUsers.filter((user) => user.id !== data.userId))
            }
        }
    }, [usersInRoom, ws, userId])

    return (
        <div className="grid items-start gap-8">
            <h1 className="text-3xl font-bold md:text-4xl">Link Room ({usersInRoom.length}/10)</h1>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                {usersInRoom.map((user, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={{ name: user.name || null, image: user.image || null }} />
                                    {user.name}
                                </div>
                            </CardTitle>
                            <CardDescription>
                                {user.username} ({user.credits} Credits)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="pb-2 text-2xl font-medium">Games ({user?.games.length}):</p>

                            <Carousel>
                                <CarouselContent>
                                    {user?.games &&
                                        user.games.map((game, index) => {
                                            const votesAmt = game.votes.reduce((acc, vote) => {
                                                if (vote.type === 'UP') return acc + 1
                                                if (vote.type === 'DOWN') return acc - 1
                                                return acc
                                            }, 0)

                                            const currentVote = game.votes.find((vote) => vote.userId === userId)

                                            return (
                                                <CarouselItem
                                                    key={index}
                                                    className="flex basis-full gap-2 lg:basis-1/2"
                                                >
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

                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </CardContent>
                    </Card>
                ))}

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
        </div>
    )
}
