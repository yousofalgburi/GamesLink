import { getAuthSession } from '@/lib/auth'
import type { SteamGame, Vote } from '@prisma/client'
import { notFound } from 'next/navigation'
import PostVoteClient from './PostVoteClient'

interface PostVoteServerProps {
    postId: string
    initialVotesAmt?: number
    initialVote?: Vote['type'] | null
    getData?: () => Promise<(SteamGame & { votes: Vote[] }) | null>
}

const PostVoteServer = async ({ postId, initialVotesAmt, initialVote, getData }: PostVoteServerProps) => {
    const session = await getAuthSession()

    let _votesAmt: number = 0
    let _currentVote: Vote['type'] | null | undefined = undefined

    if (getData) {
        const post = await getData()
        if (!post) return notFound()

        _votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc + 1
            if (vote.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        _currentVote = post.votes.find((vote) => vote.userId === session?.user?.id)?.type
    } else {
        _votesAmt = initialVotesAmt!
        _currentVote = initialVote
    }

    return <PostVoteClient gameId={postId} initialVotesAmt={_votesAmt} initialVote={_currentVote} />
}

export default PostVoteServer
