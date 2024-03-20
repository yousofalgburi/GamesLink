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
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { GamepadIcon } from 'lucide-react'
import { Room } from '@prisma/client'

export default function LinkRoom({
    roomId,
    userId,
    roomUsers,
    roomDetails,
}: {
    roomId: string
    userId: string
    roomUsers: UserInRoom[]
    roomDetails: Room
}) {
    const { toast } = useToast()
    const [usersInRoom, setUsersInRoom] = useState<UserInRoom[]>(roomUsers)
    const [userLowGameCount, setUserLowGameCount] = useState(false)

    const ws = useMemo(() => {
        return new WebSocket(`ws://localhost:8000`)
    }, [])

    useEffect(() => {
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'join', roomId, userId: userId }))
        }

        ws.onmessage = async (event) => {
            const data: { type: string; roomId: string; userId: string } = JSON.parse(event.data)

            if (data.type === 'userJoined') {
                if (!usersInRoom.find((user) => user.id === data.userId)) {
                    const { data: user } = await axios.get(
                        `/api/linkroom/events/join?userId=${data.userId}&roomId=${roomId}`
                    )
                    setUsersInRoom((prevUsers) => [...prevUsers, { ...user.user, games: user.games }])
                    if (user.games.length < 5) {
                        setUserLowGameCount(true)
                        setTimeout(() => {
                            setUserLowGameCount(false)
                        }, 10000)
                    }
                }
            } else if (data.type === 'userLeft') {
                setUsersInRoom((prevUsers) => prevUsers.filter((user) => user.id !== data.userId))
                await axios.patch(`/api/linkroom/events/leave?userId=${data.userId}&roomId=${roomId}`)
            }
        }
    }, [usersInRoom, ws, userId, roomId])

    return (
        <>
            {userLowGameCount && (
                <Alert className="mb-8">
                    <GamepadIcon className="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        A User has less than 5 games, results wont be useful unless all users have at least 5 games.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid items-start gap-8">
                <h1 className="text-3xl font-bold md:text-4xl">Link Room ({usersInRoom.length}/10)</h1>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {usersInRoom.map((user, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>
                                    <div className="flex items-center gap-2">
                                        <UserAvatar user={{ name: user.name || null, image: user.image || null }} />
                                        {user.name} {roomDetails.hostId === user.id ? '(Host)' : ''}
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    {user.username} ({user.credits} Credits)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {user?.games.length === 0 ? (
                                    <p className="text-lg font-light">No games found for this user.</p>
                                ) : (
                                    <>
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

                                                        const currentVote = game.votes.find(
                                                            (vote) => vote.userId === userId
                                                        )

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
                                    </>
                                )}
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
        </>
    )
}
