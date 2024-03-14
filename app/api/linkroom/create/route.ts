import { getAuthSession } from '@/lib/auth'
import { LinkRoomValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { roomID } = LinkRoomValidator.parse(body)

        console.log(roomID)

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 400 })
        }

        return new Response('Could not create room, please try again later.', { status: 500 })
    }
}
