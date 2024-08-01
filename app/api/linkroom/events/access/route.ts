import { auth } from '@/auth'
import { db } from '@/db'
import { roomAccessValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'
import { rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const url = new URL(req.url)

		console.log(url.searchParams.get('publicAccess'))

		const { roomId, publicAccess } = roomAccessValidator.parse({
			roomId: url.searchParams.get('roomId'),
			publicAccess: url.searchParams.get('publicAccess') === 'true',
		})

		const [roomDetails] = await db.select().from(rooms).where(eq(rooms.roomId, roomId))

		if (!roomDetails) {
			return new Response('Room not found', { status: 404 })
		}

		if (session.user.id !== roomDetails.hostId) {
			return new Response('Unauthorized', { status: 401 })
		}

		const result = await db.update(rooms).set({ isPublic: publicAccess }).where(eq(rooms.roomId, roomId)).returning()

		if (result.length === 0) {
			return new Response('Room not found', { status: 404 })
		}

		return new Response('OK!', { status: 201 })
	} catch (error) {
		console.error('Error updating room access:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not update room access, please try again later.', { status: 500 })
	}
}
