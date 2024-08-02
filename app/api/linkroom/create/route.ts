import { auth } from '@/auth'
import { db } from '@/db'
import { rooms } from '@/db/schema'
import { LinkRoomValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'

export async function POST(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const body = await req.json()
		const { roomId } = LinkRoomValidator.parse(body)

		await db.insert(rooms).values({
			hostId: session.user.id,
			roomId: roomId,
			isActive: true,
			isPublic: true,
			queuedUsers: [],
			allowedUsers: [],
			members: [session.user.id],
		})

		return new Response(JSON.stringify({ roomId }), { status: 201 })
	} catch (error) {
		console.log(error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not create room, please try again later.', { status: 500 })
	}
}
