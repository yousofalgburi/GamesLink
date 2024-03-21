import LinkRoom from '@/components/LinkRoom'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect, useRouter } from 'next/navigation'

export const metadata = {
    title: 'Link Room',
    description: 'The place where the AI powered game matching magic happens.',
}

interface PageProps {
    params: {
        id: string
    }
}

export default async function Page({ params: { id } }: PageProps) {
    const session = await getAuthSession()

    if (!session?.user) {
        return null
    }

    const roomUsers = await db.room.findUnique({
        where: {
            roomId: id,
        },
        include: {
            members: true,
        },
    })

    if (!roomUsers) return notFound()

    if (session.user.id !== roomUsers.hostId && !roomUsers.isPublic) {
        return redirect(`/link-room/queue/${id}`)
    }

    const roomUsersWithGames = await Promise.all(
        roomUsers.members.map(async (user) => {
            const games = await db.steamGame.findMany({
                where: {
                    votes: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
                include: {
                    votes: {
                        where: {
                            userId: user.id,
                        },
                    },
                },
                orderBy: {
                    voteCount: 'desc',
                },
            })

            return {
                ...user,
                games,
            }
        })
    )

    const { members, ...roomDetails } = roomUsers

    return (
        <div className="container mx-auto py-12">
            <LinkRoom roomId={id} userId={session?.user.id} roomDetails={roomDetails} roomUsers={roomUsersWithGames} />
        </div>
    )
}
