import { db } from '@/db'
import { roomEventValidator } from '@/lib/validators/linkroom'
import { z } from 'zod'
import { rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request) {
	try {
		const url = new URL(req.url)
		const { roomId } = roomEventValidator.parse({
			roomId: url.searchParams.get('roomId'),
			userId: '',
		})

		const [existingRoom] = await db.select().from(rooms).where(eq(rooms.roomId, roomId))

		if (existingRoom) {
			const result = await db.delete(rooms).where(eq(rooms.roomId, roomId)).returning()

			if (result.length === 0) {
				return new Response('Room not found or already deleted', { status: 404 })
			}
		} else {
			return new Response('Room not found', { status: 404 })
		}

		return new Response('OK!', { status: 201 })
	} catch (error) {
		console.error('Error deleting room:', error)

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 400 })
		}

		return new Response('Could not delete room, please try again later.', { status: 500 })
	}
}
