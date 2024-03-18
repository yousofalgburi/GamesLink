import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { JoinRoomValidator } from '@/lib/validators/linkroom/events/join'
import { ExtendedGame } from '@/types/db'
import { User } from '@prisma/client'
import { z } from 'zod'

export async function GET(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const url = new URL(req.url)
        const { userId } = JoinRoomValidator.parse({
            userId: url.searchParams.get('userId'),
        })

        let user = (await db.user.findUnique({
            where: {
                id: userId,
            },
        })) as User

        let games = (await db.steamGame.findMany({
            where: {
                votes: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                votes: {
                    where: {
                        userId,
                    },
                },
            },
            orderBy: {
                voteCount: 'desc',
            },
        })) as ExtendedGame[]

        return new Response(JSON.stringify({ user, games }), { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 400 })
        }

        return new Response('Could not fetch user games, please try again later.', { status: 500 })
    }
}