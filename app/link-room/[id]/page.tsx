import LinkRoom from '@/components/LinkRoom'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ExtendedGame } from '@/types/db'
import { UserInRoom } from '@/types/linkroom'
import { notFound } from 'next/navigation'

export const metadata = {
    title: 'Link Room',
    description: 'The place where the AI powered game matching magic happens.',
}

export default async function Page({ id }: { id: string }) {
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

    if (!roomUserIds) notFound()

    const roomUsers = await Promise.all(
        roomUserIds.members.map(async (user) => {
            const games = (await db.steamGame.findMany({
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
            })) as ExtendedGame[]

            return {
                ...user,
                games,
            }
        })
    )

    return (
        <div className="container mx-auto py-12">
            <LinkRoom roomUsers={roomUsers} userId={session?.user.id} />
        </div>
    )
}
