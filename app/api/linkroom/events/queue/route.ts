import { auth } from '@/auth'
import { db } from '@/db'
import { roomEventValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'
import { users, rooms } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const url = new URL(req.url)
		const { userId, roomId } = roomEventValidator.parse({
			userId: url.searchParams.get('userId'),
			roomId: url.searchParams.get('roomId'),
		})

		const [user] = await db.select().from(users).where(eq(users.id, userId))

		if (!user) {
			return new Response('User not found', { status: 404 })
		}

		const result = await db
			.update(rooms)
			.set({
				queuedUsers: sql`array_append(${rooms.queuedUsers}, ${user.id})`,
			})
			.where(eq(rooms.roomId, roomId))
			.returning({ updatedRoom: rooms.queuedUsers })

		if (result.length === 0) {
			return new Response('Room not found', { status: 404 })
		}

		return new Response(JSON.stringify({ user }), { status: 201 })
	} catch (error) {
		console.error('Error queuing user in room:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not queue user in room, please try again later.', { status: 500 })
	}
}
