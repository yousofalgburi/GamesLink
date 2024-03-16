'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { FriendsContext } from '@/lib/context/FriendsContext'
import { ExtendedGame } from '@/types/db'
import { SteamGame } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import GameCard from './GameCard'
import { UserAvatar } from './UserAvatar'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import { useToast } from './ui/use-toast'

export default function LinkRoom() {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const { loginToast } = useCustomToasts()
    const { toast } = useToast()
    const { friends } = useContext(FriendsContext)
    const [roomStarted, setRoomStarted] = useState(pathname.includes('/new') ? false : true)
    const [hostGames, setHostGames] = useState([] as SteamGame[])

    const {
        data,
        mutate: createRoom,
        isPending: isLoading,
    } = useMutation({
        mutationFn: async () => {
            const roomID = uuidv4()

            const { data } = await axios.post('/api/linkroom/create', {
                roomID,
            })

            return data as { roomID: string; games: ExtendedGame[] }
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: 'Room was not created. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: ({ roomID }) => {
            router.push(`/link-room/${roomID}`)

            setRoomStarted(true)
        },
    })

    return (
        <div className="grid grid-cols-2 gap-10">
            {roomStarted ? (
                <>
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
                            <Carousel>
                                <CarouselContent className={`${isLoading ? 'flex items-center justify-center' : ''}`}>
                                    {isLoading && <Loader2 className="animate-spin" />}

                                    {data?.games &&
                                        data.games.map((game, index) => {
                                            const votesAmt = game.votes.reduce((acc, vote) => {
                                                if (vote.type === 'UP') return acc + 1
                                                if (vote.type === 'DOWN') return acc - 1
                                                return acc
                                            }, 0)

                                            const currentVote = game.votes.find(
                                                (vote) => vote.userId === session?.user.id
                                            )

                                            return (
                                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/5">
                                                    <GameCard
                                                        className="h-[40rem]"
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
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardContent className="flex h-full w-full items-center justify-center">
                            <Button
                                onClick={() => {
                                    toast({
                                        title: 'Copied',
                                        description: 'The invite link has been copied to your clipboard',
                                    })
                                    navigator.clipboard.writeText('test')
                                }}
                            >
                                Copy Invite Link
                            </Button>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Start a Room</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Button
                            onClick={() => {
                                createRoom()
                                toast({
                                    title: 'Room Started',
                                    description: 'The room has been started',
                                })
                            }}
                        >
                            Start Room
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
