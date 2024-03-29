'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { GameVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { toast } from '../ui/use-toast'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface PostVoteClientProps {
    gameId: string
    initialVotesAmt: number
    initialVote?: VoteType | null
}

const PostVoteClient = ({ gameId, initialVotesAmt, initialVote }: PostVoteClientProps) => {
    const { data: session } = useSession()
    const router = useRouter()
    const { loginToast } = useCustomToasts()
    const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
    const [currentVote, setCurrentVote] = useState(initialVote)
    const prevVote = usePrevious(currentVote)

    // ensure sync with server
    useEffect(() => {
        setCurrentVote(initialVote)
    }, [initialVote])

    const { mutate: vote, isPending: isLoading } = useMutation({
        mutationFn: async (type: VoteType) => {
            if (!session?.user) {
                if (type === 'UP') setVotesAmt((prev) => prev - 1)
                else setVotesAmt((prev) => prev + 1)
                setCurrentVote(prevVote)
                return loginToast()
            }

            const payload: GameVoteRequest = {
                voteType: type,
                gameId: gameId,
            }

            await axios.patch('/api/games/vote', payload)
        },
        onError: (err, voteType) => {
            if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
            else setVotesAmt((prev) => prev + 1)

            // reset current vote
            setCurrentVote(prevVote)

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: 'Your vote was not registered. Please try again.',
                variant: 'destructive',
            })
        },
        onMutate: (type: VoteType) => {
            if (currentVote === type) {
                // User is voting the same way again, so remove their vote
                setCurrentVote(undefined)
                if (type === 'UP') setVotesAmt((prev) => prev - 1)
                else if (type === 'DOWN') setVotesAmt((prev) => prev + 1)
            } else {
                // User is voting in the opposite direction, so subtract 2
                setCurrentVote(type)
                if (type === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
                else if (type === 'DOWN') setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
            }

            router.refresh()
        },
    })

    return (
        <div className="flex items-center gap-4">
            {/* upvote */}
            <Button onClick={() => !isLoading && vote('UP')} variant="ghost" aria-label="upvote">
                <ThumbsUp
                    className={cn('h-5 w-5 text-zinc-700', {
                        'fill-emerald-500 text-emerald-500': currentVote === 'UP',
                    })}
                />
            </Button>

            {/* score */}
            <label className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {votesAmt}
            </label>

            {/* downvote */}
            <Button
                onClick={() => !isLoading && vote('DOWN')}
                className={cn({
                    'text-emerald-500': currentVote === 'DOWN',
                })}
                variant="ghost"
                aria-label="downvote"
            >
                <ThumbsDown
                    className={cn('h-5 w-5 text-zinc-700', {
                        'fill-red-500 text-red-500': currentVote === 'DOWN',
                    })}
                />
            </Button>
        </div>
    )
}

export default PostVoteClient
