'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExtendedGame } from '@/types/db'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { BadgeInfo, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import GameCard from './GameCard'
import SignIn from './SignIn'
import { Button } from './ui/button'
import { toast } from './ui/use-toast'

export default function RecommendedGames() {
    const [fetchOnce, setFetchOnce] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const {
        data: games,
        mutate: recommended,
        isPending: isLoading,
    } = useMutation({
        mutationFn: async () => {
            const payload = { userId: session?.user.id }

            const { data } = await axios.post(`/api/games/recommended`, payload)
            return data.recommendedGames as ExtendedGame[]
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: 'Recommended games not loaded successfully. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            router.refresh()
        },
    })

    useEffect(() => {
        if (!fetchOnce && session?.user) {
            recommended()
            setFetchOnce(true)
        }
    }, [recommended, fetchOnce, session])

    return (
        <>
            <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">Recommended Games</h1>

                    {session?.user && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <BadgeInfo className="cursor-pointer" />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Recommended Games</DialogTitle>
                                </DialogHeader>

                                <p>
                                    The recommendations are based on games you have liked/disliked. It is strongly
                                    recommended to like/dislike as many games before hitting refresh. These
                                    recommendations do not take into account your friends{"'"} likes/dislikes.
                                </p>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {session?.user && (
                    <Button isLoading={isLoading} onClick={() => recommended()}>
                        Refresh Games
                    </Button>
                )}
            </div>

            {session?.user ? (
                <Carousel
                    opts={{
                        align: 'start',
                    }}
                    className="w-full"
                >
                    <CarouselContent className={`${isLoading ? 'flex items-center justify-center' : ''}`}>
                        {isLoading && <Loader2 className="animate-spin" />}

                        {games &&
                            games.map((game, index) => {
                                const votesAmt = game.votes.reduce((acc, vote) => {
                                    if (vote.type === 'UP') return acc + 1
                                    if (vote.type === 'DOWN') return acc - 1
                                    return acc
                                }, 0)

                                const currentVote = game.votes.find((vote) => vote.userId === session?.user.id)

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
            ) : (
                <div className="flex h-20 items-center justify-center gap-4">
                    <p>Please</p>

                    <SignIn variant="link" />

                    <p>to see games you have interacted with and get recommendations.</p>
                </div>
            )}
        </>
    )
}
