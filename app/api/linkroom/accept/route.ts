import { auth } from '@/auth'
import { db } from '@/db'
import { z } from 'zod'
import { rooms } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

const acceptUserSchema = z.object({
	roomId: z.string(),
	userId: z.string(),
})

export async function POST(req: Request) {
	try {
		const session = await auth()

		if (!session?.user) {
			return new Response('Unauthorized', { status: 401 })
		}

		const body = await req.json()
		const { roomId, userId } = acceptUserSchema.parse(body)

		const [updatedRoom] = await db
			.update(rooms)
			.set({
				members: sql`array_append(${rooms.members}, ${userId})`,
				queuedUsers: sql`array_remove(${rooms.queuedUsers}, ${userId})`,
			})
			.where(eq(rooms.roomId, roomId))
			.returning({ members: rooms.members, queuedUsers: rooms.queuedUsers })

		if (!updatedRoom) {
			return new Response('Room not found', { status: 404 })
		}

		return new Response(JSON.stringify(updatedRoom), { status: 200 })
	} catch (error) {
		console.error('Error accepting user:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not accept user, please try again later.', { status: 500 })
	}
}
