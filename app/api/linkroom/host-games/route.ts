import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ExtendedGame } from '@/types/db'
import { z } from 'zod'

export async function GET(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        let games = (await db.steamGame.findMany({
            where: {
                votes: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                votes: {
                    where: {
                        userId: session.user.id,
                    },
                },
            },
            orderBy: {
                voteCount: 'desc',
            },
        })) as ExtendedGame[]

        return new Response(JSON.stringify({ games }), { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 400 })
        }

        return new Response('Could not create room, please try again later.', { status: 500 })
    }
}
