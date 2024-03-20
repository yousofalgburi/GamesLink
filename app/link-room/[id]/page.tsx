import LinkRoom from '@/components/LinkRoom'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

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
    let session = await getAuthSession()

    if (!session?.user) {
        return null
    }

    const roomUserIds = await db.room.findUnique({
        where: {
            roomId: id,
        },
        include: {
            members: true,
        },
    })

    if (!roomUserIds) return notFound()

    const roomUsers = await Promise.all(
        roomUserIds.members.map(async (user) => {
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

    console.log(roomUsers)

    return (
        <div className="container mx-auto py-12">
            <LinkRoom roomId={id} userId={session?.user.id} roomUsers={roomUsers} />
        </div>
    )
}
