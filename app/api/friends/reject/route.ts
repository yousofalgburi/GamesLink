import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { id } = z
            .object({
                id: z.string(),
            })
            .parse(body)

        // update username
        await db.friendRequest.delete({
            where: {
                id: id,
            },
        })

        return new Response('OK')
    } catch (error) {
        error

        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 400 })
        }

        return new Response('Could not reject friend request, please try again later.', { status: 500 })
    }
}
